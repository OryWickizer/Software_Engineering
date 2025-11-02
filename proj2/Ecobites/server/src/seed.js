
import {mongoose} from "mongoose";
import {User} from "./models/User.model.js";
import { MenuItem } from "./models/MenuItem.model.js";
import { Order } from "./models/Order.model.js";

export const seedData = async () => {
  try {
    
    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    
    // Create users
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '555-0001',
      role: 'customer',
      address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    });
    
    const restaurant = await User.create({
      name: 'Mario Rossi',
      email: 'mario@pizzapalace.com',
      password: 'password123',
      phone: '555-0002',
      role: 'restaurant',
      restaurantName: 'Pizza Palace',
      cuisine: ['Italian', 'Pizza'],
      address: {
        street: '456 Restaurant Ave',
        city: 'New York',
        zipCode: '10002',
        coordinates: { lat: 40.7150, lng: -74.0050 }
      }
    });
    
    const driver = await User.create({
      name: 'Mike Driver',
      email: 'mike@driver.com',
      password: 'password123',
      phone: '555-0003',
      role: 'driver',
      vehicleType: 'Motorcycle',
      licensePlate: 'ABC123',
      isAvailable: true
    });
    
    // Create menu items
    const menuItems = await MenuItem.create([
      {
        restaurantId: restaurant._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato and mozzarella',
        price: 12.99,
        category: 'main',
        preparationTime: 20,
        packagingOptions: ['reusable', 'compostable']
      },
      {
        restaurantId: restaurant._id,
        name: 'Caesar Salad',
        description: 'Fresh romaine with parmesan and croutons',
        price: 8.99,
        category: 'appetizer',
        preparationTime: 10,
        packagingOptions: ['compostable', 'minimal']
      },
      {
        restaurantId: restaurant._id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert',
        price: 6.99,
        category: 'dessert',
        preparationTime: 5,
        packagingOptions: ['minimal']
      }
    ]);
    
    // Create two customers with close geo coordinates
    const neighbor = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '555-0004',
      role: 'customer',
      address: {
        street: '125 Main St',
        city: 'New York',
        zipCode: '10001',
        coordinates: { lat: 40.7129, lng: -74.0061 }
      }
    });


    // Dynamic flow: Place order for John, then Jane, then check for combining
    // 1. John places order
    const johnOrder = await Order.create({
      customerId: customer._id,
      restaurantId: restaurant._id,
      items: [
        {
          menuItemId: menuItems[0]._id,
          name: menuItems[0].name,
          price: menuItems[0].price,
          quantity: 2
        },
        {
          menuItemId: menuItems[1]._id,
          name: menuItems[1].name,
          price: menuItems[1].price,
          quantity: 1
        }
      ],
      deliveryAddress: customer.address,
      subtotal: 34.97,
      deliveryFee: 5,
      total: 39.97,
      packagingPreference: 'reusable',
      ecoRewardPoints: 30,
      status: 'PLACED',
      statusHistory: [{
        status: 'PLACED',
        updatedBy: 'customer'
      }]
    });

    // 2. Jane places order after John
    const janeOrder = await Order.create({
      customerId: neighbor._id,
      restaurantId: restaurant._id,
      items: [
        {
          menuItemId: menuItems[2]._id,
          name: menuItems[2].name,
          price: menuItems[2].price,
          quantity: 1
        }
      ],
      deliveryAddress: neighbor.address,
      subtotal: 6.99,
      deliveryFee: 5,
      total: 11.99,
      packagingPreference: 'minimal',
      ecoRewardPoints: 10,
      status: 'PLACED',
      statusHistory: [{
        status: 'PLACED',
        updatedBy: 'customer'
      }]
    });

    // 3. Simulate dynamic check: After Jane's order, check for combining
    // (In real app, this would be triggered by backend event or polling)
    const combineController = (await import('./controller/orders.controller.js'));
    const mockReq = {
      body: { customerId: neighbor._id, radiusMeters: 500 }
    };
    const mockRes = {
      status(code) { this.statusCode = code; return this; },
      json(data) { this.data = data; return this; }
    };
    await combineController.combineOrdersWithNeighbors(mockReq, mockRes);
    if (mockRes.data && mockRes.data.combinedOrders && mockRes.data.combinedOrders.length > 0) {
      console.log(`Jane's order can be combined with:`, mockRes.data.combinedOrders.map(o => o._id));
    } else {
      console.log('No eligible orders to combine for Jane.');
    }
    
    console.log('Demo data seeded successfully!');
    console.log('Customer ID:', customer._id);
    console.log('Restaurant ID:', restaurant._id);
    console.log('Driver ID:', driver._id);
    console.log('John Order ID:', johnOrder._id);
    console.log('Jane Order ID:', janeOrder._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

