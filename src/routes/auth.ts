import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../db/schema.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { authenticate } from '../middleware/auth.js';
import { generateAuthToken } from '../utils/jwt.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        type: 'VALIDATION_ERROR'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }) as any; // Temporary type assertion

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        type: 'DUPLICATE_EMAIL'
      });
    }

    // Create user
    const user: any = new User({
      name,
      email,
      password,
      role: 'user'
    });

    await user.save();

    // Generate JWT
    const token = generateAuthToken(user._id.toString(), user.role);

    // Set secure httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user data (without password) - return just the user object to match frontend expectations
    const userData = user.toObject();
    const { password: _, ...userWithoutPassword } = userData;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        type: 'VALIDATION_ERROR'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password') as any; // Temporary type assertion

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        type: 'AUTH_ERROR'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        type: 'AUTH_ERROR'
      });
    }

    // Generate JWT
    const token = generateAuthToken(user._id.toString(), user.role);

    // Set secure httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user data (without password) - return just the user object to match frontend expectations
    const userData = user.toObject();
    const { password: _, ...userWithoutPassword } = userData;
    
    res.json(userWithoutPassword);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById((req as any).user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
});

export { router as authRoutes };