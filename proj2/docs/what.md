# What: EcoBites Components and Functions

This document provides point descriptions of each class/function in the EcoBites project.

## Backend Models

### User Model (`proj2/Ecobites/server/src/models/User.model.js`)
- **User Schema**: Defines user structure with fields like name, email, password, role (customer/restaurant/driver), address, phone, and role-specific fields (restaurantName, cuisine for restaurants; vehicleType, licensePlate for drivers).
- **rewardPoints**: Tracks eco-rewards accumulated by customers.
- **pre("save") Hook**: Hashes passwords before saving using bcrypt.
- **comparePassword Method**: Compares entered password with stored hash for authentication.

### Order Model (`proj2/Ecobites/server/src/models/Order.model.js`)
- **Order Schema**: Defines order structure with customerId, restaurantId, driverId, items array, status (PLACED to DELIVERED), packagingPreference, ecoRewardPoints, deliveryAddress, pricing fields (subtotal, deliveryFee, tax, total), paymentMethod, specialInstructions, estimatedDeliveryTime, statusHistory.
- **pre("validate") Hook**: Auto-generates unique orderNumber (e.g., ORD000001) on creation.

### MenuItem Model (`proj2/Ecobites/server/src/models/MenuItem.model.js`)
- **MenuItem Schema**: Defines menu item structure with restaurantId, name, description, price, category (appetizer/main/dessert/beverage/side), image, isAvailable, preparationTime, packagingOptions (reusable/compostable/minimal).

## Backend Controllers

### Auth Controller (`proj2/Ecobites/server/src/controller/auth.controller.js`)
- **register Function**: Handles user registration, validates input, checks for existing email, creates user with role-specific fields, generates JWT token, returns user data.
- **login Function**: Handles user login, validates credentials, compares password hash, generates JWT token, returns user data.
- **me Function**: Returns current authenticated user's profile data (set by middleware).

### Orders Controller (`proj2/Ecobites/server/src/controller/orders.controller.js`)
- **createOrder Function**: Creates new order, validates items belong to same restaurant, calculates subtotal/total, applies eco-rewards based on packaging preference, saves order with status history.
- **getOrdersByRole Function**: Retrieves orders filtered by user role (customer/restaurant/driver), populates restaurant name for drivers.
- **getOrderById Function**: Retrieves single order by ID.
- **updateOrderStatus Function**: Updates order status with authorization checks (customers can cancel, restaurants can prepare, drivers can deliver), credits eco-rewards on delivery, awards driver incentives.
- **getAvailableOrdersForDrivers Function**: Returns READY orders without assigned drivers for driver pickup.

## Frontend Components

### App Component (`proj2/Ecobites/client/src/App.jsx`)
- **Main Application Router**: Defines all routes using React Router, wraps app in RestaurantProvider context, includes public routes (/login, /about) and protected routes with role-based access (customer, restaurant, driver).
- **ProtectedRoute Component**: Wraps authenticated routes, checks login status.
- **RoleBasedRoute Component**: Wraps role-specific routes, enforces role permissions.

### Login Component (`proj2/Ecobites/client/src/pages/login.jsx`)
- **Authentication UI**: Handles both login and registration forms, toggles between modes, validates input, calls auth service, redirects based on user role after successful login.
- **State Management**: Manages form fields (name, email, phone, password), loading state, messages, registration mode toggle.
- **Navigation**: Redirects users to role-specific dashboards after authentication.

### Customer Component (`proj2/Ecobites/client/src/customers/Customer.jsx`)
- **Restaurant Discovery Interface**: Fetches and displays restaurants, handles search/filtering by cuisine, manages cart functionality.
- **Menu Viewing**: When restaurant selected, fetches and displays menu items with add-to-cart functionality.
- **Cart Management**: Maintains cart state with quantity adjustments, calculates totals, navigates to checkout.
- **State Management**: Uses RestaurantContext for selected restaurant/menu data, local state for cart and UI interactions.

### Drivers Component (`proj2/Ecobites/client/src/drivers/Drivers.jsx`)
- **Order Management Dashboard**: Displays available, current, and past orders for drivers with tabbed interface.
- **Order Acceptance/Rejection**: Handles accepting available orders, updates status through API calls.
- **Status Updates**: Allows drivers to update order status (picked up, out for delivery, delivered) with real-time UI updates.
- **Location Sharing**: Provides geolocation functionality to share driver location with customers.
- **Eco-Rewards Display**: Shows driver incentives based on vehicle type (EV bonuses), earned points, and performance metrics.
- **Reviews & Insights**: Displays customer reviews, performance analytics, and efficiency metrics.

### Restaurants Component (`proj2/Ecobites/client/src/restaurants/Restaurants.jsx`)
- **Dashboard Overview**: Provides navigation links to menu management and customer orders sections.
- **Menu Management**: Links to menu items page for creating/editing restaurant offerings.
- **Order Handling**: Links to customer orders page for accepting/rejecting incoming orders.
- **State Management**: Manages local state for menu items and orders.

