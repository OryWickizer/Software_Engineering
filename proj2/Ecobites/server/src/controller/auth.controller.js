import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const register = async (req, res) => {
  try {
    const { name, 
      email, 
      password, 
      phone, 
      role, 
      address,
      restaurantName,
      cuisine,
      vehicleType,
      licensePlate  } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

      const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address
    };
    
    if (role === 'restaurant') {
      userData.restaurantName = restaurantName;
      userData.cuisine = cuisine;
    }
    
    if (role === 'driver') {
      userData.vehicleType = vehicleType;
      userData.licensePlate = licensePlate;
    }
    
    const user = new User(userData);
    await user.save();


    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set httpOnly cookie with JWT token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints || 0,
        vehicleType: user.vehicleType || null,
        licensePlate: user.licensePlate || null,
        restaurantName: user.restaurantName || null,
        cuisine: user.cuisine || null,
        address: user.address || null,
        phone: user.phone || null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set httpOnly cookie with JWT token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        rewardPoints: user.rewardPoints || 0,
        vehicleType: user.vehicleType || null,
        licensePlate: user.licensePlate || null,
        restaurantName: user.restaurantName || null,
        cuisine: user.cuisine || null,
        address: user.address || null,
        phone: user.phone || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const me = async (req, res) => {
  try {
    // req.user is set by protect middleware with full user minus password
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      user: {
        id: req.user._id.toString(),
        _id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        rewardPoints: req.user.rewardPoints || 0,
        vehicleType: req.user.vehicleType || null,
        licensePlate: req.user.licensePlate || null,
        restaurantName: req.user.restaurantName || null,
        cuisine: req.user.cuisine || null,
        address: req.user.address || null,
        phone: req.user.phone || null,
      }
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the httpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};
