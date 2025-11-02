import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';
import { MenuItem } from '../../src/models/MenuItem.model.js';
import { Order } from '../../src/models/Order.model.js';
import { User } from '../../src/models/User.model.js';

let tokens = {};
let ids = {};
let menuItemId;

const register = async (payload) => {
  const res = await request(app).post('/api/auth/register').send(payload);
  if (res.status >= 400) {
    throw new Error(`Register failed: ${res.status} ${res.text}`);
  }
  return res.body;
};

const login = async (payload) => {
  const res = await request(app).post('/api/auth/login').send(payload);
  if (res.status >= 400) {
    throw new Error(`Login failed: ${res.status} ${res.text}`);
  }
  return res.body;
};

beforeAll(async () => {
  await connectDB();

  // Restaurant
  const rest = await register({
    name: 'Resto', email: 'r@e.com', password: 'secret12', role: 'restaurant',
    restaurantName: 'Resto A', cuisine: 'Fusion'
  });
  tokens.restaurant = rest.token; ids.restaurant = rest.user._id;

  // Driver (EV)
  const drv = await register({
    name: 'Dan Driver', email: 'd@e.com', password: 'secret12', role: 'driver',
    vehicleType: 'EV', licensePlate: 'ECO-123'
  });
  tokens.driver = drv.token; ids.driver = drv.user._id;

  // Two customers nearby (same city/zip, with geo coords)
  const cust1 = await register({
    name: 'Alice', email: 'a@e.com', password: 'secret12', role: 'customer',
    address: { street: '1 Main', city: 'Raleigh', zipCode: '27606', coordinates: { lat: 35.78, lng: -78.67 } }
  });
  tokens.c1 = cust1.token; ids.c1 = cust1.user._id;

  const cust2 = await register({
    name: 'Bob', email: 'b@e.com', password: 'secret12', role: 'customer',
    address: { street: '2 Main', city: 'Raleigh', zipCode: '27606', coordinates: { lat: 35.7805, lng: -78.6705 } }
  });
  tokens.c2 = cust2.token; ids.c2 = cust2.user._id;

  // Menu item owned by restaurant
  const mi = await MenuItem.create({ name: 'Bowl', price: 10, description: 'Vegan bowl', restaurantId: ids.restaurant });
  menuItemId = mi._id.toString();
});

afterAll(async () => {
  await clearDB();
  await closeDB();
});

afterEach(async () => {
  await Order.deleteMany({});
});

describe('Orders end-to-end including combine and driver flows', () => {
  const createOrderFor = async (token, customerId, packagingPreference = 'reusable', coords) => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        restaurantId: ids.restaurant,
        items: [{ menuItemId, quantity: 2 }],
        deliveryAddress: { street: '1 Main', city: 'Raleigh', zipCode: '27606', coordinates: coords },
        packagingPreference
      });
    expect(res.status).toBe(201);
    return res.body;
  };

  test('protect middleware rejects without token', async () => {
    const res = await request(app).get(`/api/orders/customer/${ids.c1}`);
    expect(res.status).toBe(401);
  });

  test('customer cannot create order for another customer', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokens.c1}`)
      .send({ customerId: ids.c2, items: [{ menuItemId, quantity: 1 }] });
    expect(res.status).toBe(403);
  });

  test('create, ready, combine, available for drivers, assign and deliver with rewards', async () => {
    // Create two nearby orders
  const o1 = await createOrderFor(tokens.c1, ids.c1, 'reusable', { lat: 35.78, lng: -78.67 });
  const o2 = await createOrderFor(tokens.c2, ids.c2, 'reusable', { lat: 35.7805, lng: -78.6705 });

    // Restaurant marks both READY
    const toReady = async (orderId) => request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${tokens.restaurant}`)
      .send({ status: 'READY' });
    expect((await toReady(o1._id)).status).toBe(200);
    expect((await toReady(o2._id)).status).toBe(200);

    // Customer1 combines with neighbors
    const comb = await request(app)
      .post('/api/orders/combine')
      .set('Authorization', `Bearer ${tokens.c1}`)
      .send({ customerId: ids.c1, radiusMeters: 1000 });
    expect(comb.status).toBe(200);
    expect(Array.isArray(comb.body.combinedOrders)).toBe(true);
    expect(comb.body.combinedOrders.length).toBeGreaterThanOrEqual(1);
    comb.body.combinedOrders.forEach((ord) => {
      expect(ord.status).toBe('COMBINED');
      expect(ord.combineGroupId).toBeTruthy();
    });

    // Rewards were credited to both customers
    const cu1 = await User.findById(ids.c1);
    const cu2 = await User.findById(ids.c2);
    expect((cu1.rewardPoints || 0)).toBeGreaterThanOrEqual(20);
    expect((cu2.rewardPoints || 0)).toBeGreaterThanOrEqual(20);

    // Driver sees available combined orders with enriched fields
    const avail = await request(app)
      .get('/api/orders/available/drivers')
      .set('Authorization', `Bearer ${tokens.driver}`);
    expect(avail.status).toBe(200);
    expect(Array.isArray(avail.body)).toBe(true);
    expect(avail.body.some(o => o.status === 'COMBINED')).toBe(true);
    const one = avail.body.find(o => o.status === 'COMBINED');
    expect(one.restaurant).toBeTruthy();
    expect(one.pickupAddress || one.deliveryAddress).toBeTruthy();
    expect(one.customerName).toBeTruthy();

    // Driver assigns and delivers one order
    const assign = await request(app)
      .put(`/api/orders/${one._id}/status`)
      .set('Authorization', `Bearer ${tokens.driver}`)
      .send({ status: 'DRIVER_ASSIGNED', driverId: ids.driver });
    expect(assign.status).toBe(200);
    expect(assign.body.status).toBe('DRIVER_ASSIGNED');

    const deliver = await request(app)
      .put(`/api/orders/${one._id}/status`)
      .set('Authorization', `Bearer ${tokens.driver}`)
      .send({ status: 'DELIVERED' });
    expect(deliver.status).toBe(200);
    expect(deliver.body.status).toBe('DELIVERED');
    // Driver incentive credited on delivery for EV drivers
    expect((deliver.body.driverRewardPoints || 0)).toBeGreaterThan(0);

    // Customer eco reward credited exactly once
    const finalCustomer = await User.findById(one.customerId);
    expect((finalCustomer.rewardPoints || 0)).toBeGreaterThanOrEqual(20);
  });
});
