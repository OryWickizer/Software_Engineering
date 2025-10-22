import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "your_connection_string";
console.log("MONGODB_URI:", MONGODB_URI); // Debugging line


export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";


export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});