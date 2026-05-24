import express from 'express';
import {
  searchWorkers,
  getWorkerById,
  updateWorkerProfile,
  getWorkerStats,
} from '../controllers/worker.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { searchWorkersValidation } from '../middleware/validation.middleware';

const router = express.Router();

// Public routes (with optional auth)
router.get('/search', optionalAuth, searchWorkersValidation, validate, searchWorkers);
router.get('/:id', optionalAuth, getWorkerById);

// Protected routes (workers only)
router.put('/profile', authenticate, authorize('worker'), updateWorkerProfile);
router.get('/stats/me', authenticate, authorize('worker'), getWorkerStats);

export default router;
