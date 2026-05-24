import express from 'express';
import {
  createReview,
  getWorkerReviews,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewValidation } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes
router.get('/worker/:worker_id', getWorkerReviews);

// Protected routes
router.post('/', authenticate, createReviewValidation, validate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
