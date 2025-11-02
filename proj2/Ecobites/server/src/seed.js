
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
    
    // Create sample order
    const order = await Order.create({
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
    
    console.log('Demo data seeded successfully!');
    console.log('Customer ID:', customer._id);
    console.log('Restaurant ID:', restaurant._id);
    console.log('Driver ID:', driver._id);
    console.log('Order ID:', order._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

