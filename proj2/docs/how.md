# How: EcoBites Mini-Tutorials

This document provides worked examples showing how to use key EcoBites features.

## User Registration and Login

### Registering a New Customer
1. Navigate to `/login` page
2. Click "New to EcoBites? Join now" to switch to registration mode
3. Fill in required fields:
   - Full name: "John Doe"
  - Role: "Customer" (dropdown selection)
   - Email: "john@example.com"
   - Password: "password123" (minimum 6 characters)
   - Phone: "+1234567890"
4. Click "Create Account"
5. On success, switch back to login mode and proceed to login

### Registering as a Restaurant
1. Navigate to `/login` page
2. Click "New to EcoBites? Join now"
3. Fill in required fields:
  - Full name: "Chef Mario"
  - Role: "Restaurant" (select from dropdown)
  - Email: "mario@pizzeria.com"
  - Password: "password123"
  - Phone: "+1234567890"
  - Restaurant name: "Mario's Pizzeria"
  - Cuisine types: "Italian, Pizza" (comma-separated)
4. Click "Create Account"

### Registering as a Driver
1. Navigate to `/login` page
2. Click "New to EcoBites? Join now"
3. Fill in required fields:
  - Full name: "Dave Driver"
  - Role: "Driver" (select from dropdown)
  - Email: "dave@delivery.com"
  - Password: "password123"
  - Phone: "+1234567890"
  - Vehicle type: "Electric" (dropdown - earns 15 pts/delivery)
  - License plate: "ECO-123"
4. Click "Create Account"

### Logging In
1. On login page, enter:
   - Email: "john@example.com"
   - Password: "password123"
2. Click "Sign In"
3. Redirect based on role:
   - Customer → `/customer`
   - Restaurant → `/restaurants`
   - Driver → `/driver`

## Placing an Order

### As a Customer
1. Login as customer and navigate to `/customer`
2. Browse available restaurants and menu items
3. Notice seasonal items marked with orange "Seasonal" badges and bonus reward points (e.g., "+25 pts")
4. Add items to cart with quantities (seasonal items contribute extra eco-points)
5. Proceed to checkout (`/customer/checkout`)
6. Select delivery address and packaging preference:
   - Reusable: Earns 10 eco-points
   - Compostable: Earns 5 eco-points
   - Minimal: Earns 0 eco-points
7. Add special instructions if needed
8. Confirm order placement
9. Order created with status "PLACED", order number auto-generated (e.g., ORD000001)
10. Total eco-points = packaging points + seasonal item bonus points

### Order Flow
- **PLACED** → Customer places order
- **RECEIVED** → Restaurant receives order
- **ACCEPTED** → Restaurant accepts order
- **PREPARING** → Restaurant starts preparation
- **READY** → Order ready for pickup
- **DRIVER_ASSIGNED** → Driver assigned to order
- **PICKED_UP** → Driver picks up order
- **OUT_FOR_DELIVERY** → Driver en route to customer
- **DELIVERED** → Order completed, eco-points credited to customer

## Updating Order Status

### As a Restaurant
1. Login as restaurant and navigate to `/restaurants/orders`
2. View incoming orders with status "PLACED"
3. Update status to "ACCEPTED" to confirm order
4. Update to "PREPARING" when starting food prep
5. Update to "READY" when order is prepared for pickup

### As a Driver
1. Login as driver and navigate to `/driver`
2. View available orders (`getAvailableOrdersForDrivers` API)
3. Accept a "READY" order to assign yourself as driver
4. Update status to "PICKED_UP" when collected from restaurant
5. Update to "OUT_FOR_DELIVERY" when heading to customer
6. Update to "DELIVERED" when completed
7. Earn driver incentive points based on vehicle type (electric vehicles earn more)

### As a Customer
1. Navigate to `/customer/orders` to view order history
2. View current order status and tracking
3. Cancel order if still in "PLACED" status
4. Earn eco-reward points upon successful delivery based on packaging choice and seasonal items
5. After first login, see dismissible banner encouraging seasonal highlights exploration

## Managing Menu Items (Restaurant)

### Creating a Regular Menu Item
1. Login as restaurant and navigate to `/restaurants/menu`
2. Click "Add Item" button
3. Fill in the form:
   - Item Name: "Margherita Pizza"
   - Description: "Classic tomato and mozzarella"
   - Price: 12.99
   - Category: "Main" (select from dropdown)
   - Packaging Options: Check reusable, compostable, minimal
4. Leave "Seasonal highlight" unchecked
5. Click "Create Item"

### Creating a Seasonal Menu Item
1. Follow steps 1-4 above for regular item
2. Check the "Seasonal highlight" checkbox
3. Enter seasonal reward points (e.g., 25 for main dish, 15 for beverage)
4. System will display reward points field when seasonal is checked
5. Click "Create Item"
6. Item will appear with orange "Seasonal" badge and "+X pts" indicator

### Viewing Seasonal Items
- Seasonal items show with visual badges in restaurant menu list
- Customers see seasonal items with reward point bonuses
- Use GET /api/menu/restaurant/:id/seasonal to fetch only seasonal items for a restaurant
- Use GET /api/menu/seasonal to fetch up to 20 seasonal items across all restaurants

## API Examples

### Creating an Order (POST /api/orders)
```json
{
  "customerId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "restaurantId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "items": [
    {
      "menuItemId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "packagingPreference": "reusable",
  "specialInstructions": "Extra napkins please"
}
```

### Updating Order Status (PUT /api/orders/:orderId/status)
```json
{
  "status": "DELIVERED"
}
```

### Registering a Restaurant (POST /api/auth/register)
```json
{
  "name": "Chef Mario",
  "email": "mario@pizzeria.com",
  "password": "securepass123",
  "phone": "+1987654321",
  "role": "restaurant",
  "restaurantName": "Mario's Pizzeria",
  "cuisine": ["Italian", "Pizza"],
  "address": {
    "street": "456 Restaurant Ave",
    "city": "Foodville",
    "zipCode": "67890"
  }
}
```

### Creating a Seasonal Menu Item (POST /api/menu)
```json
{
  "restaurantId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "name": "Pumpkin Harvest Bowl",
  "description": "Seasonal fall harvest bowl with roasted pumpkin and autumn vegetables",
  "price": 14.99,
  "category": "main",
  "isSeasonal": true,
  "seasonalLabel": "Halloween",
  "seasonalRewardPoints": 25,
  "packagingOptions": ["compostable", "minimal"]
}
```

### Getting Seasonal Items for a Restaurant (GET /api/menu/restaurant/:restaurantId/seasonal)
Returns all seasonal items for the specified restaurant.

### Getting All Seasonal Items (GET /api/menu/seasonal)
Returns up to 20 seasonal items across all restaurants, sorted by most recent.

## Combining Orders for Efficient Delivery

### As a Customer
1. Place an order with delivery address
2. Navigate to order detail page
3. Click "Combine with Neighbors" button
4. System finds nearby orders within 500m radius in same city/zip
5. If nearby orders found, both customers earn +20 eco-points
6. Orders marked as COMBINED status for driver efficiency

### API Example (POST /api/orders/combine)
```json
{
  "customerId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "radiusMeters": 500
}
```

Response includes combined orders and eco-point awards.

