import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  verifyWorker,
  deactivateUser,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/workers/:worker_id/verify', verifyWorker);
router.put('/users/:user_id/deactivate', deactivateUser);

export default router;
