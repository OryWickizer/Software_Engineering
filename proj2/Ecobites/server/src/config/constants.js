// Order Status Constants
export const ORDER_STATUS = {
  PLACED: 'PLACED',
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

// Packaging Options
export const PACKAGING_OPTIONS = {
  REUSABLE: 'reusable',
  COMPOSTABLE: 'compostable',
  MINIMAL: 'minimal',
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
  BIKE: 30,
  SCOOTER: 15,
  LOW_EMISSION: 15,
  DEFAULT: 5,
};

// Helper to calculate driver incentive based on vehicle type
export const calculateDriverIncentive = (vehicleType) => {
  if (!vehicleType) return DRIVER_INCENTIVES.DEFAULT;
  const vt = vehicleType.toLowerCase();
  if (vt.includes('ev') || vt.includes('electric')) return DRIVER_INCENTIVES.EV;
  if (vt.includes('bike') || vt.includes('bicycle')) return DRIVER_INCENTIVES.BIKE;
  if (vt.includes('scooter') || vt.includes('low')) return DRIVER_INCENTIVES.SCOOTER;
  return DRIVER_INCENTIVES.DEFAULT;
};

// Helper to calculate eco reward points
export const calculateEcoReward = (packagingPreference) => {
  if (!packagingPreference) return ECO_REWARDS[PACKAGING_OPTIONS.MINIMAL];
  return ECO_REWARDS[packagingPreference] || ECO_REWARDS[PACKAGING_OPTIONS.MINIMAL];
};
