const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

const getRefreshTokenExpiryDate = () => {
  const refreshTokenDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30);
  return new Date(Date.now() + (refreshTokenDays * 24 * 60 * 60 * 1000));
};

const hashRefreshToken = (refreshToken) => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const issueAuthTokens = async (user) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  user.refreshTokenHash = hashRefreshToken(refreshToken);
  user.refreshTokenExpiresAt = getRefreshTokenExpiryDate();
  await user.save();

  return { token, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, displayName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email đã được sử dụng' 
          : 'Username đã tồn tại'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      displayName: displayName || username
    });

    const { token, refreshToken } = await issueAuthTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const { token, refreshToken } = await issueAuthTokens(user);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const user = await User.findOne({
      refreshTokenHash,
      refreshTokenExpiresAt: { $gt: new Date() }
    }).select('+refreshTokenHash +refreshTokenExpiresAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }

    const tokens = await issueAuthTokens(user);

    res.status(200).json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const user = await User.findOne({
      refreshTokenHash
    }).select('+refreshTokenHash +refreshTokenExpiresAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ'
      });
    }

    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, preferences } = req.body;
    
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
