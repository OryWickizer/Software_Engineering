import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: [
      'PLACED',           // Customer placed order
      'RECEIVED',         // Restaurant received
      'ACCEPTED',         // Restaurant accepted
      'PREPARING',        // Restaurant preparing
      'READY',            // Ready for pickup
      'DRIVER_ASSIGNED',  // Driver assigned
      'PICKED_UP',        // Driver picked up
      'OUT_FOR_DELIVERY', // On the way
      'DELIVERED',        // Delivered
      'CANCELLED'         // Cancelled
    ],
    default: 'PLACED'
  },
  deliveryAddress: {
    street: String,
    city: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 5
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
    default: 'card'
  },
  specialInstructions: String,
  estimatedDeliveryTime: Date,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }]
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);