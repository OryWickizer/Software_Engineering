# EcoBites API Documentation

This document provides comprehensive documentation for the EcoBites REST API, including all endpoints, request/response formats, authentication requirements, and usage examples.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- `customer`: Can place orders, view their orders
- `restaurant`: Can manage menu items, update order status
- `driver`: Can view available orders, update delivery status

## Endpoints

### Health Check

#### GET /health

Returns the server health status.

**Authentication:** None required

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running fine!"
}
```

### Authentication

#### POST /auth/register

Register a new user account.

**Authentication:** None required

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "phone": "string (optional)",
  "role": "customer|restaurant|driver (default: customer)",
  "address": {
    "street": "string",
    "city": "string",
    "zipCode": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  // Restaurant-specific fields (if role === 'restaurant')
  "restaurantName": "string",
  "cuisine": ["string"],
  // Driver-specific fields (if role === 'driver')
  "vehicleType": "gas|electric|hybrid",
  "licensePlate": "string"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "rewardPoints": 0,
    "vehicleType": null,
    "licensePlate": null,
    "restaurantName": null,
    "cuisine": null
  }
}
```

**Error Responses:**
- 400: Missing required fields, password too short, email already registered
- 500: Server error

#### POST /auth/login

Authenticate user and return JWT token.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "rewardPoints": 0,
    "vehicleType": null,
    "licensePlate": null,
    "restaurantName": null,
    "cuisine": null
  }
}
```

**Error Responses:**
- 400: Missing email or password
- 401: Invalid credentials
- 500: Server error

#### GET /auth/me

Get current authenticated user's profile.

**Authentication:** Required (any role)

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "rewardPoints": 0,
    "vehicleType": null,
    "licensePlate": null,
    "restaurantName": null,
    "cuisine": null
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 500: Server error

### Restaurants

#### GET /restaurants

Get all restaurants.

**Authentication:** None required

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "restaurant-id",
      "name": "Restaurant Name",
      "email": "restaurant@example.com",
      "role": "restaurant",
      "restaurantName": "Mario's Pizzeria",
      "cuisine": ["Italian", "Pizza"],
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "zipCode": "12345"
      },
      "phone": "+1234567890"
    }
  ]
}
```

#### GET /restaurants/:id

Get restaurant by ID.

**Authentication:** None required

**Parameters:**
- `id` (path): Restaurant ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "restaurant-id",
    "name": "Restaurant Name",
    "email": "restaurant@example.com",
    "role": "restaurant",
    "restaurantName": "Mario's Pizzeria",
    "cuisine": ["Italian", "Pizza"],
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "zipCode": "12345"
    },
    "phone": "+1234567890"
  }
}
```

**Error Responses:**
- 404: Restaurant not found
- 500: Server error

### Menu Items

#### POST /menu

Create a new menu item (restaurant only).

**Authentication:** Required (restaurant role)

**Request Body:**
```json
{
  "restaurantId": "string (optional, defaults to authenticated restaurant)",
  "name": "string (required)",
  "description": "string",
  "price": "number (required)",
  "category": "appetizer|main|dessert|beverage|side",
  "image": "string (URL)",
  "preparationTime": "number (minutes)",
  "packagingOptions": ["reusable", "compostable", "minimal"]
}
```

**Response (201):**
```json
{
  "_id": "menu-item-id",
  "restaurantId": "restaurant-id",
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 12.99,
  "category": "main",
  "image": "https://example.com/pizza.jpg",
  "isAvailable": true,
  "preparationTime": 15,
  "packagingOptions": ["reusable", "compostable"]
}
```

**Error Responses:**
- 403: Not authorized (not a restaurant or wrong restaurant)
- 404: Restaurant not found
- 500: Server error

#### GET /menu/restaurant/:restaurantId

Get menu items for a restaurant.

**Authentication:** None required

**Parameters:**
- `restaurantId` (path): Restaurant ID

**Response (200):**
```json
[
  {
    "_id": "menu-item-id",
    "restaurantId": "restaurant-id",
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella",
    "price": 12.99,
    "category": "main",
    "image": "https://example.com/pizza.jpg",
    "isAvailable": true,
    "preparationTime": 15,
    "packagingOptions": ["reusable", "compostable"]
  }
]
```

#### PUT /menu/:id

Update a menu item (restaurant only).

**Authentication:** Required (restaurant role)

**Parameters:**
- `id` (path): Menu item ID

**Request Body:** (same as POST, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": {
    "_id": "menu-item-id",
    "restaurantId": "restaurant-id",
    "name": "Updated Pizza Name",
    "description": "Updated description",
    "price": 14.99,
    "category": "main",
    "image": "https://example.com/pizza.jpg",
    "isAvailable": true,
    "preparationTime": 15,
    "packagingOptions": ["reusable", "compostable"]
  }
}
```

**Error Responses:**
- 403: Not authorized
- 404: Menu item not found
- 500: Server error

#### DELETE /menu/:id

Delete a menu item (restaurant only).

**Authentication:** Required (restaurant role)

**Parameters:**
- `id` (path): Menu item ID

**Response (200):**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Error Responses:**
- 403: Not authorized
- 404: Menu item not found
- 500: Server error

### Orders

#### POST /orders

Create a new order (customer only).

**Authentication:** Required (customer role)

**Request Body:**
```json
{
  "customerId": "string (optional, defaults to authenticated user)",
  "restaurantId": "string (optional, derived from items)",
  "items": [
    {
      "menuItemId": "string (required)",
      "quantity": "number (default: 1)"
    }
  ],
  "deliveryAddress": {
    "street": "string",
    "city": "string",
    "zipCode": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "packagingPreference": "reusable|compostable|minimal (default: minimal)",
  "specialInstructions": "string"
}
```

**Response (201):**
```json
{
  "_id": "order-id",
  "orderNumber": "ORD000001",
  "customerId": "customer-id",
  "restaurantId": "restaurant-id",
  "items": [
    {
      "menuItemId": "menu-item-id",
      "name": "Margherita Pizza",
      "price": 12.99,
      "quantity": 1
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "packagingPreference": "reusable",
  "ecoRewardPoints": 10,
  "specialInstructions": "Extra napkins please",
  "status": "PLACED",
  "subtotal": 12.99,
  "deliveryFee": 0,
  "tax": 0,
  "total": 12.99,
  "statusHistory": [
    {
      "status": "PLACED",
      "updatedBy": "customer-id",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- 400: Invalid items, items from different restaurants
- 403: Not authorized
- 500: Server error

#### GET /orders/:role/:userId

Get orders by role and user ID.

**Authentication:** Required (any role, but must match userId or be admin)

**Parameters:**
- `role` (path): customer|restaurant|driver
- `userId` (path): User ID

**Response (200):**
```json
[
  {
    "_id": "order-id",
    "orderNumber": "ORD000001",
    "customerId": "customer-id",
    "restaurantId": "restaurant-id",
    "driverId": "driver-id",
    "items": [...],
    "status": "PLACED",
    "total": 12.99,
    "restaurant": "Mario's Pizzeria", // populated for drivers
    "pickupAddress": {...}, // populated for drivers
    "customerName": "John Doe", // populated for drivers
    "customerPhone": "+1234567890", // populated for drivers
    "deliveryAddress": {...}
  }
]
```

#### GET /orders/detail/:orderId

Get order by ID.

**Authentication:** Required (any role)

**Parameters:**
- `orderId` (path): Order ID

**Response (200):**
```json
{
  "_id": "order-id",
  "orderNumber": "ORD000001",
  "customerId": "customer-id",
  "restaurantId": "restaurant-id",
  "driverId": "driver-id",
  "items": [...],
  "status": "PLACED",
  "total": 12.99,
  "deliveryAddress": {...},
  "packagingPreference": "reusable",
  "ecoRewardPoints": 10,
  "specialInstructions": "Extra napkins please",
  "statusHistory": [...]
}
```

**Error Responses:**
- 404: Order not found
- 500: Server error

#### PATCH /orders/:orderId/status

Update order status.

**Authentication:** Required (role-based permissions)

**Parameters:**
- `orderId` (path): Order ID

**Request Body:**
```json
{
  "status": "CANCELLED|ACCEPTED|PREPARING|READY|DRIVER_ASSIGNED|PICKED_UP|OUT_FOR_DELIVERY|DELIVERED",
  "driverId": "string (optional, for DRIVER_ASSIGNED)"
}
```

**Response (200):** Returns updated order object

**Permissions:**
- `CANCELLED`: Only customer who placed the order
- `ACCEPTED|PREPARING|READY`: Only restaurant that owns the order
- `DRIVER_ASSIGNED|PICKED_UP|OUT_FOR_DELIVERY|DELIVERED`: Only drivers

**Error Responses:**
- 403: Not authorized for this status update
- 404: Order not found
- 500: Server error

#### PUT /orders/:orderId/status

Same as PATCH above (for compatibility with tests).

#### GET /orders/available/drivers

Get available orders for drivers (READY and COMBINED orders without assigned driver).

**Authentication:** Required (driver role only)

**Response (200):**
```json
[
  {
    "_id": "order-id",
    "orderNumber": "ORD000001",
    "restaurant": "Mario's Pizzeria",
    "pickupAddress": {...},
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "deliveryAddress": {...},
    "items": [...],
    "total": 12.99,
    "status": "READY"
  }
]
```

**Error Responses:**
- 403: Not a driver
- 500: Server error

#### POST /orders/combine

Combine orders with nearby customers for delivery optimization.

**Authentication:** Required (any role)

**Request Body:**
```json
{
  "customerId": "string (required)",
  "radiusMeters": "number (default: 500)"
}
```

**Response (200):**
```json
{
  "message": "Orders combined! Both you and your neighbors earned 20 eco points.",
  "combinedOrders": [...],
  "updatedOrderIds": [...]
}
```

**Error Responses:**
- 400: Customer address not found, no nearby orders
- 500: Server error

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Eco-Rewards System

- **Packaging Preferences:**
  - `reusable`: +10 eco-points
  - `compostable`: +5 eco-points
  - `minimal`: +0 eco-points

- **Order Combination:** +20 eco-points for participating customers

- **Driver Incentives:**
  - Electric vehicles: +15 points per delivery
  - Hybrid vehicles: +10 points per delivery
  - Gas vehicles: +5 points per delivery

## Order Status Flow

```
PLACED → RECEIVED → ACCEPTED → PREPARING → READY → DRIVER_ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

Customers can cancel orders while status is `PLACED`.
