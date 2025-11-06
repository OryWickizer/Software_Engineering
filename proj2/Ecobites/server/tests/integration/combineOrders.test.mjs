import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.model.js';
import { Order } from '../../src/models/Order.model.js';
import { MenuItem } from '../../src/models/MenuItem.model.js';
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';

beforeAll(async () => {
  await connectDB();
}, 30000); // 30 second timeout for beforeAll

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Combine Orders Integration Tests', () => {
  let customer1, customer2, customer3, customer4;
  let restaurant;
  let menuItem;
  let order1, order2, order3, order4;
  let customerAgent;

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Order.deleteMany({});
    await MenuItem.deleteMany({});

    // Create agent to maintain cookies
    customerAgent = request.agent(app);

    // Create restaurant user
    restaurant = await User.create({
      name: 'Test Restaurant',
      email: 'restaurant@test.com',
      password: 'password123',
      phone: '555-0100',
      role: 'restaurant',
      restaurantName: 'Test Pizza',
      cuisine: ['Italian'],
      address: {
        street: '100 Food Ave',
        city: 'Test City',
        zipCode: '10001',
        coordinates: { lat: 40.75, lng: -74.00 }
      }
    });

    // Create menu item
    menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: 'Test Pizza',
      description: 'Delicious test pizza',
      price: 15,
      category: 'main',
      preparationTime: 20,
      packagingOptions: ['reusable']
    });

    // Create 4 customers in the same neighborhood
    customer1 = await User.create({
      name: 'Customer 1',
      email: 'customer1@test.com',
      password: 'password123',
      phone: '555-0201',
      role: 'customer',
      address: {
        street: '200 Main St',
        city: 'Test City',
        zipCode: '10001',
        coordinates: { lat: 40.72, lng: -74.01 }
      }
    });

    customer2 = await User.create({
      name: 'Customer 2',
      email: 'customer2@test.com',
      password: 'password123',
      phone: '555-0202',
      role: 'customer',
      address: {
        street: '202 Main St',
        city: 'Test City',
        zipCode: '10001',
        coordinates: { lat: 40.72 + 0.002, lng: -74.01 - 0.002 } // ~200m away
      }
    });

    customer3 = await User.create({
      name: 'Customer 3',
      email: 'customer3@test.com',
      password: 'password123',
      phone: '555-0203',
      role: 'customer',
      address: {
        street: '204 Main St',
        city: 'Test City',
        zipCode: '10001',
        coordinates: { lat: 40.72 + 0.004, lng: -74.01 - 0.004 } // ~400m away
      }
    });

    customer4 = await User.create({
      name: 'Customer 4',
      email: 'customer4@test.com',
      password: 'password123',
      phone: '555-0204',
      role: 'customer',
      address: {
        street: '300 Elm St',
        city: 'Other City',
        zipCode: '10002',
        coordinates: { lat: 40.80, lng: -74.10 } // Different city
      }
    });

    // Create orders for each customer
    const orderBase = {
      restaurantId: restaurant._id,
      items: [{
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }],
      subtotal: 15,
      deliveryFee: 5,
      tax: 2,
      total: 22,
      packagingPreference: 'reusable',
      ecoRewardPoints: 10,
      statusHistory: [{ status: 'READY', updatedBy: 'restaurant' }],
      driverId: null,
      paymentMethod: 'card',
      estimatedDeliveryTime: new Date(Date.now() + 30*60000)
    };

    order1 = await Order.create({
      ...orderBase,
      customerId: customer1._id,
      deliveryAddress: customer1.address,
      status: 'READY'
    });

    order2 = await Order.create({
      ...orderBase,
      customerId: customer2._id,
      deliveryAddress: customer2.address,
      status: 'READY'
    });

    order3 = await Order.create({
      ...orderBase,
      customerId: customer3._id,
      deliveryAddress: customer3.address,
      status: 'READY'
    });

    order4 = await Order.create({
      ...orderBase,
      customerId: customer4._id,
      deliveryAddress: customer4.address,
      status: 'READY'
    });

    // Login as customer1 using agent
    await customerAgent
      .post('/api/auth/login')
      .send({ email: 'customer1@test.com', password: 'password123' });
  });

  it('should successfully combine orders from nearby customers', async () => {
    const res = await customerAgent
      .post('/api/orders/combine')
      .send({ customerId: customer1._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Orders combined');
    expect(res.body.combinedOrders.length).toBeGreaterThanOrEqual(2); // At least customer1 and customer2
    expect(res.body.updatedOrderIds.length).toBeGreaterThanOrEqual(2);

    // Verify orders are marked as COMBINED
    const updatedOrder1 = await Order.findById(order1._id);
    expect(updatedOrder1.status).toBe('COMBINED');
    expect(updatedOrder1.combineGroupId).toBeTruthy();

    const updatedOrder2 = await Order.findById(order2._id);
    expect(updatedOrder2.status).toBe('COMBINED');
    expect(updatedOrder2.combineGroupId).toBe(updatedOrder1.combineGroupId);

    // Verify reward points were added
    const updatedCustomer1 = await User.findById(customer1._id);
    expect(updatedCustomer1.rewardPoints).toBe(20);

    const updatedCustomer2 = await User.findById(customer2._id);
    expect(updatedCustomer2.rewardPoints).toBe(20);
  });

  it('should not combine orders from different cities', async () => {
    const res = await customerAgent
      .post('/api/orders/combine')
      .send({ customerId: customer1._id.toString() });

    expect(res.status).toBe(200);
    
    // Customer4 is in different city, should not be included
    const order4Updated = await Order.findById(order4._id);
    expect(order4Updated.status).toBe('READY'); // Should still be READY, not COMBINED
  });

  it('should return error when customer has no active orders', async () => {
    // Delete customer1's order
    await Order.deleteOne({ _id: order1._id });

    const res = await customerAgent
      .post('/api/orders/combine')
      .send({ customerId: customer1._id.toString() });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("don't have any active orders");
  });

  it('should return message when no nearby orders exist', async () => {
    // Delete all other customers' orders
    await Order.deleteMany({ customerId: { $ne: customer1._id } });

    const res = await customerAgent
      .post('/api/orders/combine')
      .send({ customerId: customer1._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('No nearby orders to combine');
    expect(res.body.combinedOrders.length).toBe(0);
  });

  it('should assign same combineGroupId to all combined orders', async () => {
    const res = await customerAgent
      .post('/api/orders/combine')
      .send({ customerId: customer1._id.toString() });

    expect(res.status).toBe(200);

    const updatedOrder1 = await Order.findById(order1._id);
    const updatedOrder2 = await Order.findById(order2._id);
    
    expect(updatedOrder1.combineGroupId).toBeTruthy();
    expect(updatedOrder1.combineGroupId).toBe(updatedOrder2.combineGroupId);
    expect(updatedOrder1.combineGroupId).toContain('GRP');
  });
});
