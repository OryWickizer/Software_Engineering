import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'driver' | 'restaurant' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    community?: string; // For combined orders feature
  };
  rewardPoints: number;
  ecoPreferences: {
    prefersEcoPackaging: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['customer', 'driver', 'restaurant', 'admin'], 
    default: 'customer' 
  },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    community: String
  },
  rewardPoints: { type: Number, default: 0 },
  ecoPreferences: {
    prefersEcoPackaging: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Create geospatial index for location-based queries
userSchema.index({ 'address.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare passwords method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);