import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';
import MenuItem from '../../src/models/MenuItem.model.js';
import Order from '../../src/models/Order.model.js';
import User from '../../src/models/User.model.js';

let authToken;
let userId;
let restaurantId;
let menuItemId;

beforeAll(async () => {
  await connectDB();

  // Create a test restaurant user
  const restaurantResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Restaurant',
      email: 'restaurant@test.com',
      password: 'password123',
      role: 'restaurant'
    });
  restaurantId = restaurantResponse.body.user._id;

  // Create a test customer
  const customerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });
  authToken = customerResponse.body.token;
  userId = customerResponse.body.user._id;

  // Create a test menu item
  const menuItem = await MenuItem.create({
    name: 'Test Item',
    price: 9.99,
    description: 'Test Description',
    restaurantId
  });
  menuItemId = menuItem._id;
});

afterEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await clearDB();
  await closeDB();
});

describe('Menu Items API', () => {
  test('GET /api/menu/restaurant/:restaurantId - gets restaurant menu items', async () => {
    const response = await request(app)
      .get(`/api/menu/restaurant/${restaurantId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('name', 'Test Item');
    expect(response.body[0]).toHaveProperty('price', 9.99);
  });

  test('POST /api/menu - creates new menu item (restaurant only)', async () => {
    const restaurantLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'restaurant@test.com',
        password: 'password123'
      });

    const response = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${restaurantLogin.body.token}`)
      .send({
        name: 'New Item',
        price: 12.99,
        description: 'New Description'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', 'New Item');
    expect(response.body).toHaveProperty('price', 12.99);
  });
});

describe('Orders API', () => {
  test('POST /api/orders - creates new order', async () => {
    const orderData = {
      customerId: userId,
      restaurantId,
      items: [{
        menuItemId,
        name: 'Test Item',
        price: 9.99,
        quantity: 2
      }],
      total: 19.98,
      status: 'pending'
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('customerId', userId);
    expect(response.body).toHaveProperty('total', 19.98);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toHaveProperty('menuItemId', menuItemId.toString());
  });

  test('GET /api/orders/customer/:customerId - gets customer orders', async () => {
    // First create an order
    await Order.create({
      customerId: userId,
      restaurantId,
      items: [{
        menuItemId,
        name: 'Test Item',
        price: 9.99,
        quantity: 2
      }],
      total: 19.98,
      status: 'pending'
    });

    const response = await request(app)
      .get(`/api/orders/customer/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('customerId', userId);
    expect(response.body[0]).toHaveProperty('total', 19.98);
  });

  test('PUT /api/orders/:orderId/status - updates order status', async () => {
    // Create an order first
    const order = await Order.create({
      customerId: userId,
      restaurantId,
      items: [{
        menuItemId,
        name: 'Test Item',
        price: 9.99,
        quantity: 2
      }],
      total: 19.98,
      status: 'pending'
    });

    const restaurantLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'restaurant@test.com',
        password: 'password123'
      });

    const response = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${restaurantLogin.body.token}`)
      .send({ status: 'preparing' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'preparing');
  });
});