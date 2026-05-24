import { Response, NextFunction } from 'express';
import { User, Worker } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { createOTP, verifyOTP, resendOTP } from '../services/otp.service';
import { generateTokens } from '../utils/jwt';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const sendOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, purpose } = req.body;

    await createOTP(phone, purpose);

    res.status(200).json(
      ApiResponse.success('OTP sent successfully', {
        phone,
        expiresIn: `${process.env.OTP_EXPIRY_MINUTES || 10} minutes`,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOTPController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp, purpose } = req.body;

    await verifyOTP(phone, otp, purpose);

    res.status(200).json(
      ApiResponse.success('OTP verified successfully', { verified: true })
    );
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { full_name, phone, role, password, email, worker_data } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      throw ApiError.conflict('Phone number already registered');
    }

    // Create user
    const user = await User.create({
      full_name,
      phone,
      role,
      password,
      email,
      is_verified: true, // Since OTP was verified
    });

    // If worker, create worker profile
    if (role === 'worker' && worker_data) {
      await Worker.create({
        user_id: user.id,
        trade: worker_data.trade,
        experience_years: worker_data.experience_years || 1,
        description: worker_data.description,
        city: worker_data.city,
        area: worker_data.area,
        latitude: worker_data.latitude,
        longitude: worker_data.longitude,
        min_charge: worker_data.min_charge || 500,
        hourly_rate: worker_data.hourly_rate || 300,
        visit_charge: worker_data.visit_charge || 200,
        cnic: worker_data.cnic,
        portfolio_photos: worker_data.portfolio_photos || [],
        service_areas: worker_data.service_areas || [],
      });
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info(`User registered: ${user.id}, role: ${user.role}`);

    res.status(201).json(
      ApiResponse.created('Registration successful', {
        user: user.toJSON(),
        ...tokens,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Verify password
    if (password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid credentials');
      }
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info(`User logged in: ${user.id}`);

    res.status(200).json(
      ApiResponse.success('Login successful', {
        user: user.toJSON(),
        ...tokens,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const loginWithOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    // Verify OTP
    await verifyOTP(phone, otp, 'login');

    // Find user
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      throw ApiError.notFound('User not found. Please register first.');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info(`User logged in with OTP: ${user.id}`);

    res.status(200).json(
      ApiResponse.success('Login successful', {
        user: user.toJSON(),
        ...tokens,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw ApiError.badRequest('Refresh token is required');
    }

    const { verifyRefreshToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refresh_token);

    // Generate new tokens
    const tokens = generateTokens({
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role,
    });

    res.status(200).json(
      ApiResponse.success('Token refreshed successfully', tokens)
    );
  } catch (error) {
    next(ApiError.unauthorized('Invalid refresh token'));
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'workerProfile',
          required: false,
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json(
      ApiResponse.success('Profile retrieved successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { full_name, email, profile_photo_url } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update({
      full_name: full_name || user.full_name,
      email: email || user.email,
      profile_photo_url: profile_photo_url || user.profile_photo_url,
    });

    res.status(200).json(
      ApiResponse.success('Profile updated successfully', user.toJSON())
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json(
      ApiResponse.success('Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};
