import { body, param, query, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits (without country code)'),

  body('role')
    .isIn(['customer', 'worker'])
    .withMessage('Role must be either customer or worker'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const sendOTPValidation: ValidationChain[] = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),

  body('purpose')
    .isIn(['registration', 'login', 'password_reset'])
    .withMessage('Invalid purpose'),
];

export const verifyOTPValidation: ValidationChain[] = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),

  body('purpose')
    .isIn(['registration', 'login', 'password_reset'])
    .withMessage('Invalid purpose'),
];

export const loginValidation: ValidationChain[] = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const createBookingValidation: ValidationChain[] = [
  body('worker_id')
    .notEmpty()
    .withMessage('Worker ID is required')
    .isUUID()
    .withMessage('Invalid worker ID'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('scheduled_date')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format'),

  body('time_preference')
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Invalid time preference'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
];

export const updateBookingValidation: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID'),

  body('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  body('final_price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Final price must be a positive number'),
];

export const createReviewValidation: ValidationChain[] = [
  body('booking_id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isUUID()
    .withMessage('Invalid booking ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
];

export const searchWorkersValidation: ValidationChain[] = [
  query('trade')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Trade cannot be empty'),

  query('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),

  query('min_rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Min rating must be between 0 and 5'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
