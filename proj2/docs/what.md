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
- **isSeasonal**: Boolean field to mark seasonal/limited-time menu items (default: false).
- **seasonalLabel**: String field for seasonal theme/label (e.g., "Halloween", "Christmas", "Summer").
- **seasonalRewardPoints**: Number field for bonus eco-points earned when ordering seasonal items (default: 0).

## Backend Controllers

### Auth Controller (`proj2/Ecobites/server/src/controller/auth.controller.js`)
- **register Function**: Handles user registration, validates input, checks for existing email, creates user with role-specific fields, generates JWT token, returns user data.
- **login Function**: Handles user login, validates credentials, compares password hash, generates JWT token, returns user data.
- **me Function**: Returns current authenticated user's profile data (set by middleware).

### Orders Controller (`proj2/Ecobites/server/src/controller/orders.controller.js`)
- **createOrder Function**: Creates new order, validates items belong to same restaurant, calculates subtotal/total, applies eco-rewards based on packaging preference and seasonal items, saves order with status history.
- **getOrdersByRole Function**: Retrieves orders filtered by user role (customer/restaurant/driver), populates restaurant name for drivers.
- **getOrderById Function**: Retrieves single order by ID.
- **updateOrderStatus Function**: Updates order status with authorization checks (customers can cancel, restaurants can prepare, drivers can deliver), credits eco-rewards on delivery, awards driver incentives.
- **getAvailableOrdersForDrivers Function**: Returns READY orders without assigned drivers for driver pickup.
- **combineOrdersWithNeighbors Function**: Combines nearby orders for delivery optimization, awards eco-points to participating customers.

### Menu Controller (`proj2/Ecobites/server/src/controller/menu.controller.js`)
- **createMenuItem Function**: Creates new menu item for restaurant, validates restaurant ownership, saves with default availability, supports seasonal item fields.
- **getMenuByRestaurant Function**: Retrieves all available menu items for specified restaurant, sorted by category and name.
- **getSeasonalByRestaurant Function**: Retrieves only seasonal items (isSeasonal: true) for a specific restaurant, sorted by most recently updated.
- **getSeasonalAll Function**: Retrieves up to 20 seasonal items across all restaurants, sorted by most recently created.
- **updateMenuItem Function**: Updates menu item details, validates restaurant ownership, allows updating seasonal status and reward points.
- **deleteMenuItem Function**: Removes menu item, validates restaurant ownership.

### Restaurant Controller (`proj2/Ecobites/server/src/controller/restaurant.controller.js`)
- **getAllRestaurants Function**: Retrieves all users with restaurant role, sorted by restaurant name.
- **getRestaurantById Function**: Retrieves specific restaurant by ID, validates role.

### Health Controller (`proj2/Ecobites/server/src/controller/healthController.js`)
- **getHealth Function**: Returns server status and health message.

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
- **Seasonal Highlights Display**: Shows seasonal item badges and reward point bonuses on menu items.
- **Seasonal Banner**: Displays dismissible post-login banner encouraging customers to try seasonal highlights.
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

### Menu Items Component (`proj2/Ecobites/client/src/restaurants/MenuItems.jsx`)
- **Menu Display**: Shows current menu items for restaurant with edit/delete options, displays seasonal badges and reward points.
- **Add Item Form**: Modal/form for creating new menu items with validation, includes seasonal highlight toggle and reward points input.
- **Edit Item Form**: Inline editing for existing menu items, allows updating seasonal status and points.
- **Seasonal Item Management**: Checkbox to mark items as seasonal, input field for bonus reward points, visual badges in item list.
- **Category Management**: Dropdown selection for menu item categories (appetizer, main, dessert, beverage, side).
- **Packaging Options**: Multi-select checkboxes for packaging types (reusable, compostable, minimal).

### Customer Orders Component (`proj2/Ecobites/client/src/restaurants/CustomerOrders.jsx`)
- **Order List**: Displays incoming orders with status indicators.
- **Status Updates**: Buttons to update order status (accept, prepare, ready).
- **Order Details**: Expandable view showing order items, customer info, special instructions.

### Checkout Component (`proj2/Ecobites/client/src/customers/Checkout.jsx`)
- **Order Summary**: Displays cart items, quantities, prices, and totals.
- **Packaging Selection**: Radio buttons for reusable/compostable/minimal packaging with eco-points display.
- **Address Input**: Form fields for delivery address.
- **Special Instructions**: Text area for delivery notes.
- **Order Placement**: Submit button to create order via API.

### Order Detail Component (`proj2/Ecobites/client/src/customers/OrderDetail.jsx`)
- **Order Tracking**: Shows current status with progress indicator.
- **Order Information**: Displays items, pricing, delivery address.
- **Status History**: Timeline of status changes with timestamps.
- **Driver Info**: Shows assigned driver details when available.

### Order Status Component (`proj2/Ecobites/client/src/customers/OrderStatus.jsx`)
- **Status Display**: Visual representation of order status.
- **Real-time Updates**: Polls API for status changes.
- **Action Buttons**: Cancel order (if eligible) or contact support.

### Profile Component (`proj2/Ecobites/client/src/pages/Profile.jsx`)
- **User Information**: Displays and allows editing of user profile.
- **Eco-Rewards Balance**: Shows accumulated eco-points.
- **Order History**: Links to past orders.
- **Account Settings**: Password change, notification preferences.

## Frontend Services

### Auth Service (`proj2/Ecobites/client/src/api/services/auth.service.js`)
- **register Function**: Calls POST /api/auth/register with user data.
- **login Function**: Calls POST /api/auth/login, stores JWT token.
- **getProfile Function**: Calls GET /api/auth/me for current user data.
- **logout Function**: Clears stored tokens and redirects to login.

### Menu Service (`proj2/Ecobites/client/src/api/services/menu.service.js`)
- **getByRestaurant Function**: Calls GET /api/menu/restaurant/:id.
- **getSeasonalByRestaurant Function**: Calls GET /api/menu/restaurant/:id/seasonal.
- **getSeasonalAll Function**: Calls GET /api/menu/seasonal.
- **create Function**: Calls POST /api/menu with item data (including seasonal fields).
- **update Function**: Calls PUT /api/menu/:id with updates.
- **delete Function**: Calls DELETE /api/menu/:id.

### Order Service (`proj2/Ecobites/client/src/api/services/order.service.js`)
- **createOrder Function**: Calls POST /api/orders with order data.
- **getOrdersByRole Function**: Calls GET /api/orders/:role/:userId.
- **getOrderById Function**: Calls GET /api/orders/detail/:orderId.
- **updateOrderStatus Function**: Calls PATCH /api/orders/:orderId/status.
- **getAvailableOrders Function**: Calls GET /api/orders/available/drivers.
- **combineOrders Function**: Calls POST /api/orders/combine.

### Restaurant Service (`proj2/Ecobites/client/src/api/services/restaurant.service.js`)
- **getAllRestaurants Function**: Calls GET /api/restaurants.
- **getRestaurantById Function**: Calls GET /api/restaurants/:id.

### User Service (`proj2/Ecobites/client/src/api/services/user.service.js`)
- **updateProfile Function**: Calls PUT /api/auth/me with profile updates.
- **getRewardHistory Function**: Calls GET /api/users/rewards (future endpoint).

## Frontend Contexts

### Auth Context (`proj2/Ecobites/client/src/context/AuthContext.jsx`)
- **State Management**: Stores user data, authentication status, JWT token.
- **Login/Logout Functions**: Handles authentication flow, token storage.
- **Role-based Access**: Provides user role for conditional rendering.

### Cart Context (`proj2/Ecobites/client/src/context/CartContext.jsx`)
- **Cart State**: Manages items, quantities, totals.
- **Add/Remove Items**: Functions to modify cart contents.
- **Persistence**: Saves cart to localStorage.

### Restaurant Context (`proj2/Ecobites/client/src/context/RestaurantContext.jsx`)
- **Restaurant Data**: Stores selected restaurant and menu items.
- **Search/Filter**: Functions for finding restaurants by cuisine.
- **Menu Loading**: Handles fetching menu data on restaurant selection.

## Frontend Hooks

### useAuth (`proj2/Ecobites/client/src/hooks/useAuth.js`)
- **Authentication State**: Returns current user, login status.
- **Auth Actions**: Provides login, logout, register functions.

### useAuthContext (`proj2/Ecobites/client/src/hooks/useAuthContext.js`)
- **Context Access**: Hook to access AuthContext values.

### useMenu (`proj2/Ecobites/client/src/hooks/useMenu.js`)
- **Menu Data**: Fetches and caches menu items for restaurant.
- **CRUD Operations**: Provides functions for menu item management.

### useOrders (`proj2/Ecobites/client/src/hooks/useOrders.js`)
- **Order Management**: Fetches user orders, handles status updates.
- **Real-time Updates**: Polls for order status changes.

### useRestaurant (`proj2/Ecobites/client/src/hooks/useRestaurant.js`)
- **Restaurant Data**: Fetches restaurant list and details.
- **Search Functionality**: Filters restaurants by criteria.

## Frontend Utilities

### Constants (`proj2/Ecobites/client/src/utils/constants.js`)
- **API Base URL**: Base URL for API calls.
- **Order Statuses**: List of valid order statuses.
- **Eco-Rewards**: Point values for different actions.

### Helpers (`proj2/Ecobites/client/src/utils/helpers.js`)
- **Format Currency**: Formats prices for display.
- **Calculate Distance**: Calculates distance between coordinates.
- **Validate Email**: Email validation utility.

### Validators (`proj2/Ecobites/client/src/utils/validators.js`)
- **Form Validation**: Functions to validate user input.
- **Address Validation**: Validates delivery addresses.
- **Phone Validation**: Phone number format checking.

## Frontend Tests

### Auth Service Tests (`proj2/Ecobites/client/src/tests/services/auth.service.test.js`)
- **Registration Tests**: Mocks API calls for user registration.
- **Login Tests**: Tests successful and failed login scenarios.
- **Profile Tests**: Tests fetching user profile data.

### Order Service Tests (`proj2/Ecobites/client/src/tests/services/order.service.test.js`)
- **Order Creation**: Tests order placement with valid/invalid data.
- **Status Updates**: Tests order status change permissions.
- **Order Retrieval**: Tests fetching orders by role.

### Component Tests
- **Login Test** (`proj2/Ecobites/client/src/tests/Login.test.jsx`): Tests login form functionality, registration flow, validation.
- **MenuItems Test** (`proj2/Ecobites/client/src/tests/MenuItems.test.jsx`): Tests menu CRUD operations, seasonal item toggles, packaging options, form validation.
- **Order Detail Test** (`proj2/Ecobites/client/src/tests/OrderDetail.test.jsx`): Tests order display components, combine orders functionality.
- **Order Status Test** (`proj2/Ecobites/client/src/tests/OrderStatus.test.jsx`): Tests status update UI.
- **Customer Orders Test** (`proj2/Ecobites/client/src/tests/CustomerOrders.test.jsx`): Tests restaurant order management interface.
- **Drivers Test** (`proj2/Ecobites/client/src/tests/Drivers.test.jsx`): Tests driver dashboard components, order acceptance, status updates.
- **Combine Orders Test** (`proj2/Ecobites/client/src/tests/CombineOrders.test.jsx`): Tests order combination feature for delivery optimization.

## Backend Middleware

### Auth Middleware (`proj2/Ecobites/server/src/middleware/auth.middleware.js`)
- **protect Function**: Verifies JWT token, sets req.user.
- **authorize Function**: Checks user role against required roles.

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

## Backend Configuration

### Constants (`proj2/Ecobites/server/src/config/constants.js`)
- **Eco-Rewards Calculation**: Functions to calculate eco-points based on packaging and driver incentives.
- **Order Statuses**: Valid order status values.
- **Packaging Options**: Available packaging preferences.

### Environment Configuration (`proj2/Ecobites/server/src/config/env.js`)
- **Database Connection**: Establishes MongoDB connection using Mongoose.
- **Environment Variables**: Loads and validates required env vars (MONGODB_URI, JWT_SECRET, PORT).

## Testing

### Unit Tests (`proj2/Ecobites/server/tests/unit/`)
- **User Model Test** (`User.test.js`): Tests user model methods, password hashing, validation.

### Integration Tests (`proj2/Ecobites/server/tests/integration/`)
- **Auth Tests** (`auth.test.mjs`): Tests registration, login, authentication middleware.
- **Orders Tests** (`orders.test.mjs`, `orders.combined.test.mjs`): Tests order creation, status updates, combination logic.

## Package Scripts

### Server Scripts
- **start**: Runs the server with nodemon for development.
- **dev**: Alternative development server command.
- **test**: Runs Jest tests with coverage.
- **test:watch**: Runs tests in watch mode.

### Client Scripts
- **dev**: Starts Vite development server.
- **build**: Builds production bundle.
- **test**: Runs Vitest tests.
- **preview**: Previews production build locally.

