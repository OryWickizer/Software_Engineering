import mongoose from 'mongoose';
const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['appetizer', 'main', 'dessert', 'beverage', 'side'],
    required: false,
    default: 'main'
  },
  image: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  // Seasonal highlights
  isSeasonal: {
    type: Boolean,
    default: false
  },
  seasonalLabel: {
    type: String,
    default: ''
  },
  seasonalRewardPoints: {
    type: Number,
    default: 0
  },
  // Supported sustainable packaging options for this item/restaurant
  packagingOptions: {
    type: [
      {
        type: String,
        enum: ['reusable', 'compostable', 'minimal']
      }
    ],
    default: ['reusable', 'compostable', 'minimal']
  }
}, {
  timestamps: true
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Provide default export for compatibility with some tests/imports
export default MenuItem;