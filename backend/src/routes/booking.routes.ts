import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createBookingValidation,
  updateBookingValidation,
} from '../middleware/validation.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createBookingValidation, validate, createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingValidation, validate, updateBookingStatus);
router.post('/:id/cancel', cancelBooking);

export default router;
