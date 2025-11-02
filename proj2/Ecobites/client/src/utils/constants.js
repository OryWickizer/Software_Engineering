export const ORDER_STATUS = {
  PLACED: 'Order Placed',
  RECEIVED: 'Restaurant Received',
  ACCEPTED: 'Order Accepted',
  PREPARING: 'Preparing Food',
  READY: 'Ready for Pickup',
  DRIVER_ASSIGNED: 'Driver Assigned',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DRIVER: 'driver',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
};

export const MENU_CATEGORIES = {
  APPETIZER: 'appetizer',
  MAIN: 'main',
  DESSERT: 'dessert',
  BEVERAGE: 'beverage',
  SIDE: 'side',
};

// Eco Packaging Options
export const PACKAGING_OPTIONS = {
  REUSABLE: 'reusable',
  COMPOSTABLE: 'compostable',
  MINIMAL: 'minimal',
};

export const PACKAGING_LABELS = {
  [PACKAGING_OPTIONS.REUSABLE]: 'Reusable Container',
  [PACKAGING_OPTIONS.COMPOSTABLE]: 'Compostable',
  [PACKAGING_OPTIONS.MINIMAL]: 'Minimal Packaging',
};

// Eco Reward Points per packaging type
export const ECO_REWARDS = {
  [PACKAGING_OPTIONS.REUSABLE]: 30,
  [PACKAGING_OPTIONS.COMPOSTABLE]: 20,
  [PACKAGING_OPTIONS.MINIMAL]: 10,
};

// Driver Vehicle Types
export const VEHICLE_TYPES = {
  EV: 'EV',
  ELECTRIC: 'Electric',
  BIKE: 'Bike',
  BICYCLE: 'Bicycle',
  SCOOTER: 'Scooter',
  LOW_EMISSION: 'Low Emission',
  MOTORCYCLE: 'Motorcycle',
  CAR: 'Car',
};

// Driver Green Delivery Incentives (points per delivery)
export const DRIVER_INCENTIVES = {
  EV: 25,
  ELECTRIC: 25,
  BIKE: 30,
  BICYCLE: 30,
  SCOOTER: 15,
  LOW_EMISSION: 15,
  DEFAULT: 5,
};

// Order Status Groups
export const ORDER_STATUS_GROUPS = {
  PENDING: ['PLACED', 'RECEIVED', 'ACCEPTED'],
  IN_PROGRESS: ['PREPARING', 'READY'],
  IN_TRANSIT: ['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'],
  COMPLETED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
};

// Status colors for badges
export const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  READY: 'bg-purple-100 text-purple-700',
  DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};