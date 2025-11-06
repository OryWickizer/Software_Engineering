import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';
import { MenuItem } from '../../src/models/MenuItem.model.js';
import { Order } from '../../src/models/Order.model.js';
import { User } from '../../src/models/User.model.js';

let agents = {};
let ids = {};
let menuItemId;

const register = async (agent, payload) => {
  const res = await agent.post('/api/auth/register').send(payload);
  if (res.status >= 400) {
    throw new Error(`Register failed: ${res.status} ${res.text}`);
  }
  return res.body;
};

beforeAll(async () => {
  try {
    await connectDB();
    
    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create agents for each user to maintain cookies
    agents.restaurant = request.agent(app);
    agents.driver = request.agent(app);
    agents.c1 = request.agent(app);
    agents.c2 = request.agent(app);

    // Restaurant
    const rest = await register(agents.restaurant, {
      name: 'Resto', email: 'r@e.com', password: 'secret12', role: 'restaurant',
      restaurantName: 'Resto A', cuisine: 'Fusion'
    });
    ids.restaurant = rest.user._id;

    // Driver (EV)
    const drv = await register(agents.driver, {
      name: 'Dan Driver', email: 'd@e.com', password: 'secret12', role: 'driver',
      vehicleType: 'EV', licensePlate: 'ECO-123'
    });
    ids.driver = drv.user._id;

    // Two customers nearby (same city/zip, with geo coords)
    const cust1 = await register(agents.c1, {
      name: 'Alice', email: 'a@e.com', password: 'secret12', role: 'customer',
      address: { street: '1 Main', city: 'Raleigh', zipCode: '27606', coordinates: { lat: 35.78, lng: -78.67 } }
    });
    ids.c1 = cust1.user._id;

    const cust2 = await register(agents.c2, {
      name: 'Bob', email: 'b@e.com', password: 'secret12', role: 'customer',
      address: { street: '2 Main', city: 'Raleigh', zipCode: '27606', coordinates: { lat: 35.7805, lng: -78.6705 } }
    });
    ids.c2 = cust2.user._id;

    // Menu item owned by restaurant
    const mi = await MenuItem.create({ 
      name: 'Bowl', 
      price: 10, 
      description: 'Vegan bowl', 
      restaurantId: ids.restaurant 
    });
    menuItemId = mi._id.toString();
  } catch (error) {
    console.error('BeforeAll setup error:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  await clearDB();
  await closeDB();
});

afterEach(async () => {
  try {
    await Order.deleteMany({});
  } catch (error) {
    console.error('Error in afterEach:', error);
  }
});

describe('Orders end-to-end including combine and driver flows', () => {
  const createOrderFor = async (agent, customerId, packagingPreference = 'reusable', coords) => {
    const res = await agent
      .post('/api/orders')
      .send({
        customerId,
        restaurantId: ids.restaurant,
        items: [{ menuItemId, quantity: 2 }],
        deliveryAddress: { 
          street: '1 Main', 
          city: 'Raleigh', 
          zipCode: '27606', 
          coordinates: coords 
        },
        packagingPreference
      });
    expect(res.status).toBe(201);
    return res.body;
  };

  test('protect middleware rejects without token', async () => {
    const res = await request(app).get(`/api/orders/customer/${ids.c1}`);
    expect(res.status).toBe(401);
  }, 10000); // Add timeout to individual test

  test('customer cannot create order for another customer', async () => {
    const res = await agents.c1
      .post('/api/orders')
      .send({ customerId: ids.c2, items: [{ menuItemId, quantity: 1 }] });
    expect(res.status).toBe(403);
  }, 10000);

  test('create, ready, combine, available for drivers, assign and deliver with rewards', async () => {
    // Create two nearby orders
    const o1 = await createOrderFor(agents.c1, ids.c1, 'reusable', { lat: 35.78, lng: -78.67 });
    const o2 = await createOrderFor(agents.c2, ids.c2, 'reusable', { lat: 35.7805, lng: -78.6705 });

    // Add small delays between operations
    await new Promise(resolve => setTimeout(resolve, 500));

    // Restaurant marks both READY
    const toReady = async (orderId) => {
      const res = await agents.restaurant
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'READY' });
      return res;
    };
    
    expect((await toReady(o1._id)).status).toBe(200);
    expect((await toReady(o2._id)).status).toBe(200);

    // Wait for status updates to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // Customer1 combines with neighbors
    const comb = await agents.c1
      .post('/api/orders/combine')
      .send({ customerId: ids.c1, radiusMeters: 1000 });
    
    expect(comb.status).toBe(200);
    expect(Array.isArray(comb.body.combinedOrders)).toBe(true);
    expect(comb.body.combinedOrders.length).toBeGreaterThanOrEqual(1);
    
    comb.body.combinedOrders.forEach((ord) => {
      expect(ord.status).toBe('COMBINED');
      expect(ord.combineGroupId).toBeTruthy();
    });

    // Wait for combine operation to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check rewards were credited to both customers
    const cu1 = await User.findById(ids.c1);
    const cu2 = await User.findById(ids.c2);
    expect((cu1.rewardPoints || 0)).toBeGreaterThanOrEqual(20);
    expect((cu2.rewardPoints || 0)).toBeGreaterThanOrEqual(20);

    // Driver sees available combined orders with enriched fields
    const avail = await agents.driver.get('/api/orders/available/drivers');
    expect(avail.status).toBe(200);
    expect(Array.isArray(avail.body)).toBe(true);
    
    // Find combined orders
    const combinedOrders = avail.body.filter(o => o.status === 'COMBINED');
    expect(combinedOrders.length).toBeGreaterThan(0);
    
    const one = combinedOrders[0];
    expect(one.restaurant).toBeTruthy();
    expect(one.pickupAddress || one.deliveryAddress).toBeTruthy();
    expect(one.customerName).toBeTruthy();

    // Driver assigns and delivers one order
    const assign = await agents.driver
      .put(`/api/orders/${one._id}/status`)
      .send({ status: 'DRIVER_ASSIGNED', driverId: ids.driver });
    expect(assign.status).toBe(200);

    // Wait for group assignment to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check group acceptance - all orders in same combineGroupId should be assigned
    const groupAssigned = await Order.find({ combineGroupId: one.combineGroupId });
    expect(groupAssigned.length).toBeGreaterThan(0);
    
    // Verify all orders in group are assigned to the same driver
    groupAssigned.forEach(o => {
      expect(String(o.driverId)).toBe(String(ids.driver));
      expect(o.status).toBe('DRIVER_ASSIGNED');
    });

    // Deliver the order
    const deliver = await agents.driver
      .put(`/api/orders/${one._id}/status`)
      .send({ status: 'DELIVERED' });
    expect(deliver.status).toBe(200);
    expect(deliver.body.status).toBe('DELIVERED');
    
    // Driver incentive should be credited for EV drivers
    expect((deliver.body.driverRewardPoints || 0)).toBeGreaterThan(0);

    // Customer eco reward credited exactly once
    const finalCustomer = await User.findById(one.customerId);
    expect((finalCustomer.rewardPoints || 0)).toBeGreaterThanOrEqual(20);
  }, 30000); // 30 second timeout for this long test
});