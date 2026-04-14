// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User, Donor, Hospital } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password_hash: password,
      role,
    });

    // Create role-specific profile
    if (role === 'donor') {
      await Donor.create({
        user_id: user.id,
        ...profileData,
      });
    } else if (role === 'hospital') {
      await Hospital.create({
        user_id: user.id,
        ...profileData,
        is_approved: false, // Requires admin approval
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Get role-specific profile
    let profile = null;
    if (user.role === 'donor') {
      profile = await Donor.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ where: { user_id: user.id } });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        profile,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'donor') {
      profile = await Donor.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'hospital') {
      profile = await Hospital.findOne({ where: { user_id: user.id } });
    }

    res.json({
      success: true,
      data: { user: user.toJSON(), profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};