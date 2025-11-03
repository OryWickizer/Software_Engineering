import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'driver'],
    required: true
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // For restaurants
  restaurantName: String,
  restaurantImage: String,
  cuisine: [String],
  
  // For drivers
  vehicleType: String,
  licensePlate: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Eco rewards accumulated by the user (customers)
  rewardPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});



// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);

// Provide default export for compatibility with default imports in tests
export default User;
