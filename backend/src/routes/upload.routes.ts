import express from 'express';
import {
  uploadProfilePhoto,
  uploadPortfolioPhotos,
  deletePortfolioPhoto,
} from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../services/upload.service';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload profile photo
router.post('/profile-photo', upload.single('photo'), uploadProfilePhoto);

// Upload portfolio photos (workers only)
router.post(
  '/portfolio',
  authorize('worker'),
  upload.array('photos', 10),
  uploadPortfolioPhotos
);

// Delete portfolio photo (workers only)
router.delete('/portfolio', authorize('worker'), deletePortfolioPhoto);

export default router;
