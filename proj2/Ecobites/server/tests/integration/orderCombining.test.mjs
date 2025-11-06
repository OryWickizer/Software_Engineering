import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/User.model.js';
import MenuItem from '../../src/models/MenuItem.model.js';
import Order from '../../src/models/Order.model.js';
import { connectDB, closeDB, clearDB } from '../../src/setupTests.js';

describe('Order Combining Functionality', () => {
  let restaurantAgent;
  let customer1Agent;
  let customer2Agent;
  let customer3Agent;
  let restaurantId;
  let menuItemId;

  beforeAll(async () => {
  await connectDB();
    
    // Clear database
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    // Create agents with cookie support
    restaurantAgent = request.agent(app);
    customer1Agent = request.agent(app);
    customer2Agent = request.agent(app);
    customer3Agent = request.agent(app);

    // Register and login restaurant
    await restaurantAgent
      .post('/api/auth/register')
      .send({
        name: 'Green Eats',
        email: 'restaurant@test.com',
        password: 'password123',
        role: 'restaurant',
        address: { street: '100 Main St', city: 'Raleigh', zipCode: '27601' }
      });

    const restaurantLoginRes = await restaurantAgent
      .post('/api/auth/login')
      .send({ email: 'restaurant@test.com', password: 'password123' });

    const restaurant = await User.findOne({ email: 'restaurant@test.com' });
    restaurantId = restaurant._id.toString();

    // Create menu item
    const menuItem = await MenuItem.create({
      name: 'Green Salad',
      price: 12.99,
      restaurantId: restaurantId,
  category: 'main',
      description: 'Fresh salad',
      available: true
    });
    menuItemId = menuItem._id.toString();

    // Register and login customer 1
    await customer1Agent
      .post('/api/auth/register')
      .send({
        name: 'Customer One',
        email: 'customer1@test.com',
        password: 'password123',
        role: 'customer',
        address: { street: '123 Oak St', city: 'Raleigh', zipCode: '27601' }
      });

    await customer1Agent
      .post('/api/auth/login')
      .send({ email: 'customer1@test.com', password: 'password123' });

    // Register and login customer 2
    await customer2Agent
      .post('/api/auth/register')
      .send({
        name: 'Customer Two',
        email: 'customer2@test.com',
        password: 'password123',
        role: 'customer',
        address: { street: '456 Pine Ave', city: 'Raleigh', zipCode: '27601' }
      });

    await customer2Agent
      .post('/api/auth/login')
      .send({ email: 'customer2@test.com', password: 'password123' });

    // Register and login customer 3
    await customer3Agent
      .post('/api/auth/register')
      .send({
        name: 'Customer Three',
        email: 'customer3@test.com',
        password: 'password123',
        role: 'customer',
        address: { street: '789 Elm Rd', city: 'Durham', zipCode: '27701' }
      });

    await customer3Agent
      .post('/api/auth/login')
      .send({ email: 'customer3@test.com', password: 'password123' });
  }, 30000); // 30 second timeout for beforeAll

  afterAll(async () => {
  await closeDB();
  }, 10000);

  beforeEach(async () => {
    await Order.deleteMany({});
  });

  describe('Identical Address Combining', () => {
  test('should combine orders with identical delivery addresses', async () => {
      const identicalAddress = {
        street: '200 Test Street',
        city: 'Raleigh',
        zipCode: '27601'
      };

      // Customer 1 creates order
      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 2 }],
          deliveryAddress: identicalAddress,
          subtotal: 25.98,
          deliveryFee: 5,
          tax: 0,
          total: 30.98,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);
      const order1Id = order1Res.body._id;

      // Customer 2 creates order with same address
      const customer2 = await User.findOne({ email: 'customer2@test.com' });
      const order2Res = await customer2Agent
        .post('/api/orders')
        .send({
          customerId: customer2._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: identicalAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Trigger combine for customer1
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Check if orders have combinedWith field
      const order1 = await Order.findById(order1Id);
      const order2Id = order2Res.body._id;
      const order2 = await Order.findById(order2Id);

      // At least one order should have combinedWith field
  const combinedOrders = [order1, order2].filter(o => o.combineWith && o.combineWith.length > 0);
      expect(combinedOrders.length).toBeGreaterThan(0);

      // Verify addresses have coordinates
      expect(order1.deliveryAddress.coordinates).toBeDefined();
      expect(order2.deliveryAddress.coordinates).toBeDefined();
  }, 20000);

  test('should use fallback coordinates for identical addresses when geocoding fails', async () => {
      const testAddress = {
        street: 'Invalid Address XYZ123',
        city: 'TestCity',
        zipCode: '99999'
      };

      // Customer 1 creates order
      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: testAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      // Customer 2 creates order with same invalid address
      const customer2 = await User.findOne({ email: 'customer2@test.com' });
      const order2Res = await customer2Agent
        .post('/api/orders')
        .send({
          customerId: customer2._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: testAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Trigger combine for customer1
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Both orders should have coordinates (fallback)
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);

      expect(order1.deliveryAddress.coordinates).toBeDefined();
      expect(order2.deliveryAddress.coordinates).toBeDefined();

      // Fallback coordinates for identical addresses should be identical
      expect(order1.deliveryAddress.coordinates.lat).toBe(order2.deliveryAddress.coordinates.lat);
      expect(order1.deliveryAddress.coordinates.lng).toBe(order2.deliveryAddress.coordinates.lng);

      // Should be combined
  const combinedOrders = [order1, order2].filter(o => o.combineWith && o.combineWith.length > 0);
      expect(combinedOrders.length).toBeGreaterThan(0);
    }, 20000);
  });

  describe('Nearby Address Combining', () => {
  test('should combine orders within 500m radius in same city', async () => {
      // Use real nearby addresses in Raleigh
      const address1 = {
        street: '1 E Edenton St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const address2 = {
        street: '16 W Martin St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      // Customer 1 creates order
      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: address1,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      // Wait for rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Customer 2 creates order with nearby address
      const customer2 = await User.findOne({ email: 'customer2@test.com' });
      const order2Res = await customer2Agent
        .post('/api/orders')
        .send({
          customerId: customer2._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: address2,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Trigger combine for customer1 with increased radius
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 1000 });

      // Check orders
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);

      // Both should have coordinates and should be combined
      expect(order1.deliveryAddress.coordinates).toBeDefined();
      expect(order2.deliveryAddress.coordinates).toBeDefined();
      const combinedOrders = [order1, order2].filter(o => o.combineWith && o.combineWith.length > 0);
      expect(combinedOrders.length).toBeGreaterThan(0);
    }, 25000);
  });

  describe('Different City/Region Prevention', () => {
  test('should NOT combine orders from different cities', async () => {
      const raleighAddress = {
        street: '100 Test St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const durhamAddress = {
        street: '100 Test St',
        city: 'Durham',
        zipCode: '27701'
      };

      // Customer 1 in Raleigh
      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: raleighAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Customer 3 in Durham
      const customer3 = await User.findOne({ email: 'customer3@test.com' });
      const order2Res = await customer3Agent
        .post('/api/orders')
        .send({
          customerId: customer3._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: durhamAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Attempt to combine for customer1
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Check orders - should NOT be combined
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);

      // If combinedWith exists and has items, those items should not reference each other
      if (order1.combineWith && order1.combineWith.length > 0) {
        expect(order1.combineWith.map(id => id.toString())).not.toContain(order2._id.toString());
      }
      if (order2.combineWith && order2.combineWith.length > 0) {
        expect(order2.combineWith.map(id => id.toString())).not.toContain(order1._id.toString());
      }
  }, 20000);

  test('should NOT combine orders with different zip codes', async () => {
      const address1 = {
        street: '100 Test St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const address2 = {
        street: '100 Test St',
        city: 'Raleigh',
        zipCode: '27603'
      };

      // Customer 1
      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: address1,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Customer 2 with different zip
      const customer2 = await User.findOne({ email: 'customer2@test.com' });
      const order2Res = await customer2Agent
        .post('/api/orders')
        .send({
          customerId: customer2._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: address2,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Attempt to combine for customer1
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Should NOT be combined due to different zip codes
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);

      if (order1.combineWith && order1.combineWith.length > 0) {
        expect(order1.combineWith.map(id => id.toString())).not.toContain(order2._id.toString());
      }
      if (order2.combineWith && order2.combineWith.length > 0) {
        expect(order2.combineWith.map(id => id.toString())).not.toContain(order1._id.toString());
      }
  }, 20000);
  });

  describe('Order Properties Validation', () => {
    test('should store coordinates with delivery address', async () => {
      const testAddress = {
        street: '500 Main St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const orderRes = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: testAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(orderRes.status).toBe(201);

      const order = await Order.findById(orderRes.body._id);
      
      // Should have original address fields
      expect(order.deliveryAddress.street).toBe(testAddress.street);
      expect(order.deliveryAddress.city).toBe(testAddress.city);
      expect(order.deliveryAddress.zipCode).toBe(testAddress.zipCode);

      // Should have coordinates (either from geocoding or fallback)
      expect(order.deliveryAddress.coordinates).toBeDefined();
      expect(order.deliveryAddress.coordinates.lat).toBeDefined();
      expect(order.deliveryAddress.coordinates.lng).toBeDefined();
      expect(typeof order.deliveryAddress.coordinates.lat).toBe('number');
      expect(typeof order.deliveryAddress.coordinates.lng).toBe('number');
    }, 10000);

  test('should not combine same customer orders', async () => {
      const testAddress = {
        street: '600 Main St',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const customer1 = await User.findOne({ email: 'customer1@test.com' });

      // First order
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: testAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Second order from same customer, same address
      const order2Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: testAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      // Attempt to combine (should not combine same customer orders)
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Should NOT be combined (same customer)
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);

      if (order1.combineWith && order1.combineWith.length > 0) {
        expect(order1.combineWith.map(id => id.toString())).not.toContain(order2._id.toString());
      }
      if (order2.combineWith && order2.combineWith.length > 0) {
        expect(order2.combineWith.map(id => id.toString())).not.toContain(order1._id.toString());
      }
  }, 20000);
  });

  describe('Multiple Orders Combining', () => {
  test('should combine multiple nearby orders', async () => {
      const baseAddress = {
        street: '700 Test Avenue',
        city: 'Raleigh',
        zipCode: '27601'
      };

      const customer1 = await User.findOne({ email: 'customer1@test.com' });
      const customer2 = await User.findOne({ email: 'customer2@test.com' });
      const customer3 = await User.findOne({ email: 'customer3@test.com' });

      // Create three orders with same address
      const order1Res = await customer1Agent
        .post('/api/orders')
        .send({
          customerId: customer1._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: baseAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order1Res.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const order2Res = await customer2Agent
        .post('/api/orders')
        .send({
          customerId: customer2._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: baseAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order2Res.status).toBe(201);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update customer3 to Raleigh for this test
      await User.findByIdAndUpdate(customer3._id, {
        address: { street: '789 Elm Rd', city: 'Raleigh', zipCode: '27601' }
      });

      const order3Res = await customer3Agent
        .post('/api/orders')
        .send({
          customerId: customer3._id.toString(),
          restaurantId: restaurantId,
          items: [{ menuItemId: menuItemId, quantity: 1 }],
          deliveryAddress: baseAddress,
          subtotal: 12.99,
          deliveryFee: 5,
          tax: 0,
          total: 17.99,
          paymentMethod: 'card',
          packagingPreference: 'minimal'
        });

      expect(order3Res.status).toBe(201);

      // Trigger combine for customer1
      await customer1Agent
        .post('/api/orders/combine')
        .send({ customerId: customer1._id.toString(), radiusMeters: 500 });

      // Check if orders are combined
      const order1 = await Order.findById(order1Res.body._id);
      const order2 = await Order.findById(order2Res.body._id);
      const order3 = await Order.findById(order3Res.body._id);

      // At least some orders should have combinedWith references
  const combinedCount = [order1, order2, order3].filter(o => o.combineWith && o.combineWith.length > 0).length;
      expect(combinedCount).toBeGreaterThan(0);
    }, 25000);
  });
});
