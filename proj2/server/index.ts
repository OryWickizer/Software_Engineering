import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from './config/database.ts';
import authRoutes from './routes/auth.routes.ts';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDatabase();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/rewards', rewardRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});