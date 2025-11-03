
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

    // --- Generate demo users ---
    const restaurantNames = [
      'Pizza Palace', 'Green Eats', 'Sushi Zen', 'Burger Haven', 'Taco Fiesta',
      'Veggie Delight', 'Curry House', 'Pasta Point', 'BBQ Barn', 'Salad Stop',
      'Dumpling Den', 'Falafel Factory'
    ];
    const cuisines = [
      ['Italian', 'Pizza'], ['Vegan'], ['Japanese', 'Sushi'], ['American', 'Burgers'], ['Mexican'],
      ['Vegetarian'], ['Indian'], ['Italian', 'Pasta'], ['BBQ'], ['Healthy'], ['Chinese'], ['Middle Eastern']
    ];
    const restaurantUsers = [];
    for (let i = 0; i < restaurantNames.length; i++) {
      restaurantUsers.push(await User.create({
        name: `Owner ${i+1}`,
        email: `owner${i+1}@${restaurantNames[i].replace(/\s/g,'').toLowerCase()}.com`,
        password: 'password123',
        phone: `555-01${String(i+1).padStart(2,'0')}`,
        role: 'restaurant',
        restaurantName: restaurantNames[i],
        cuisine: cuisines[i],
        address: {
          street: `${100+i} Food Ave`,
          city: 'Demo City',
          zipCode: `100${i+1}`,
          coordinates: { lat: 40.71 + i*0.01, lng: -74.00 - i*0.01 }
        }
      }));
    }

    const customerUsers = [];
    // Create customers in 3 neighborhoods - some close together for combining orders
    const neighborhoods = [
      { city: 'Demo City', zipCode: '10001', baseLat: 40.72, baseLng: -74.01 }, // Neighborhood 1: customers 1-4
      { city: 'Demo City', zipCode: '10002', baseLat: 40.75, baseLng: -74.05 }, // Neighborhood 2: customers 5-8
      { city: 'Demo City', zipCode: '10003', baseLat: 40.78, baseLng: -74.09 }  // Neighborhood 3: customers 9-12
    ];
    for (let i = 0; i < 12; i++) {
      const neighborhood = neighborhoods[Math.floor(i / 4)];
      customerUsers.push(await User.create({
        name: `Customer ${i+1}`,
        email: `customer${i+1}@demo.com`,
        password: 'password123',
        phone: `555-02${String(i+1).padStart(2,'0')}`,
        role: 'customer',
        address: {
          street: `${200+i} Main St`,
          city: neighborhood.city,
          zipCode: neighborhood.zipCode,
          // Place customers within 200m of each other in same neighborhood
          coordinates: { 
            lat: neighborhood.baseLat + (i % 4) * 0.002, // ~200m apart
            lng: neighborhood.baseLng - (i % 4) * 0.002 
          }
        }
      }));
    }

    const driverUsers = [];
    const vehicles = ['EV', 'Bike', 'Scooter', 'Car', 'Van', 'Motorcycle'];
    for (let i = 0; i < 6; i++) {
      driverUsers.push(await User.create({
        name: `Driver ${i+1}`,
        email: `driver${i+1}@demo.com`,
        password: 'password123',
        phone: `555-03${String(i+1).padStart(2,'0')}`,
        role: 'driver',
        vehicleType: vehicles[i],
        licensePlate: `XYZ${100+i}`,
        isAvailable: true
      }));
    }

    // --- Generate menu items ---
    const categories = ['appetizer', 'main', 'dessert', 'beverage', 'side'];
    const packagingOptions = [
      ['reusable'], ['compostable'], ['minimal'], ['reusable','compostable'], ['compostable','minimal'], ['reusable','minimal']
    ];
    const menuItems = [];
    for (let r = 0; r < restaurantUsers.length; r++) {
      for (let m = 0; m < 5; m++) {
        menuItems.push(await MenuItem.create({
          restaurantId: restaurantUsers[r]._id,
          name: `${categories[m]} ${restaurantNames[r]} ${m+1}`,
          description: `Delicious ${categories[m]} from ${restaurantNames[r]}`,
          price: 5 + m*3 + r,
          category: categories[m],
          preparationTime: 10 + m*5,
          packagingOptions: packagingOptions[(r+m)%packagingOptions.length]
        }));
      }
    }

    // --- Generate orders ---
    // First, create one active order for each customer in neighborhood 1 (customers 0-3) for combining demo
    for (let i = 0; i < 4; i++) {
      const cust = customerUsers[i];
      const rest = restaurantUsers[i % restaurantUsers.length];
      const items = menuItems.filter(mi => String(mi.restaurantId) === String(rest._id));
      const orderItems = [
        {
          menuItemId: items[0]._id,
          name: items[0].name,
          price: items[0].price,
          quantity: 2
        }
      ];
      await Order.create({
        customerId: cust._id,
        restaurantId: rest._id,
        items: orderItems,
        deliveryAddress: cust.address,
        subtotal: items[0].price * 2,
        deliveryFee: 5,
        tax: 2,
        total: items[0].price * 2 + 7,
        packagingPreference: 'reusable',
        ecoRewardPoints: 10,
        status: 'READY', // All READY so they can be combined
        statusHistory: [{ status: 'READY', updatedBy: 'restaurant' }],
        driverId: null,
        paymentMethod: 'card',
        specialInstructions: 'For combine demo',
        estimatedDeliveryTime: new Date(Date.now() + 30*60000)
      });
    }
    
    // Then create additional orders for variety
    for (let o = 0; o < 20; o++) {
      const cust = customerUsers[(o + 4) % customerUsers.length]; // Start from customer 5
      const rest = restaurantUsers[o % restaurantUsers.length];
      const items = menuItems.filter(mi => String(mi.restaurantId) === String(rest._id));
      const orderItems = [
        {
          menuItemId: items[o%items.length]._id,
          name: items[o%items.length].name,
          price: items[o%items.length].price,
          quantity: 1 + (o%3)
        },
        {
          menuItemId: items[(o+1)%items.length]._id,
          name: items[(o+1)%items.length].name,
          price: items[(o+1)%items.length].price,
          quantity: 1
        }
      ];
      const orderStatus = ['PLACED','ACCEPTED','PREPARING','READY','READY','READY'][o%6];
      await Order.create({
        customerId: cust._id,
        restaurantId: rest._id,
        items: orderItems,
        deliveryAddress: cust.address,
        subtotal: orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
        deliveryFee: 5,
        tax: 2,
        total: orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0) + 7,
        packagingPreference: ['reusable','compostable','minimal'][o%3],
        ecoRewardPoints: 10 + (o%5)*5,
        status: orderStatus,
        statusHistory: [{
          status: orderStatus,
          updatedBy: 'customer'
        }],
        // Only assign driver for DELIVERED/CANCELLED orders (not in this dataset now)
        driverId: orderStatus === 'DELIVERED' ? driverUsers[o%driverUsers.length]._id : null,
        paymentMethod: ['card','cash','online'][o%3],
        specialInstructions: o%2===0 ? 'Extra napkins please' : '',
        estimatedDeliveryTime: new Date(Date.now() + (30+o*5)*60000)
      });
    }

    console.log('Seeded demo data:');
    console.log(`Restaurants: ${restaurantUsers.length}`);
    console.log(`Customers: ${customerUsers.length}`);
    console.log(`Drivers: ${driverUsers.length}`);
    console.log(`Menu Items: ${menuItems.length}`);
    console.log('Orders: 24');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

