# How: EcoBites Mini-Tutorials

This document provides worked examples showing how to use key EcoBites features.

## User Registration and Login

### Registering a New Customer
1. Navigate to `/login` page
2. Click "New to EcoBites? Join now" to switch to registration mode
3. Fill in required fields:
   - Full name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123" (minimum 6 characters)
   - Phone: "+1234567890"
4. Click "Create Account"
5. On success, switch back to login mode and proceed to login

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
3. Add items to cart with quantities
4. Proceed to checkout (`/customer/checkout`)
5. Select delivery address and packaging preference:
   - Reusable: Earns 10 eco-points
   - Compostable: Earns 5 eco-points
   - Minimal: Earns 0 eco-points
6. Add special instructions if needed
7. Confirm order placement
8. Order created with status "PLACED", order number auto-generated (e.g., ORD000001)

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
4. Earn eco-reward points upon successful delivery based on packaging choice

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
