import express from 'express';
import { sendMessage, getMessages, markAsRead } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  [
    body('booking_id').isUUID().withMessage('Invalid booking ID'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('message_type').optional().isIn(['text', 'image', 'voice', 'location']),
  ],
  validate,
  sendMessage
);

router.get(
  '/:booking_id',
  [param('booking_id').isUUID().withMessage('Invalid booking ID')],
  validate,
  getMessages
);

router.put(
  '/:booking_id/read',
  [param('booking_id').isUUID().withMessage('Invalid booking ID')],
  validate,
  markAsRead
);

export default router;
