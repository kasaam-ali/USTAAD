import express from 'express';
import {
  sendOTP,
  verifyOTPController,
  register,
  login,
  loginWithOTP,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  sendOTPValidation,
  verifyOTPValidation,
  registerValidation,
  loginValidation,
} from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTPValidation, validate, sendOTP);
router.post('/verify-otp', verifyOTPValidation, validate, verifyOTPController);
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/login-otp', verifyOTPValidation, validate, loginWithOTP);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;
