import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.ts';

// Use express.Request and express.Response instead
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all fields' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = new User({ name, email, password, role: role || 'customer' });
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered:', email);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', email);
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};