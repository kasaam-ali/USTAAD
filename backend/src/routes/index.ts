import express from 'express';
import authRoutes from './auth.routes';
import workerRoutes from './worker.routes';
import bookingRoutes from './booking.routes';
import reviewRoutes from './review.routes';
import uploadRoutes from './upload.routes';
import messageRoutes from './message.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ustaad API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    features: {
      authentication: 'OTP + JWT ✅',
      ai: 'Gemini AI ✅',
      realtime: 'Socket.io ✅',
      storage: 'Google Cloud Storage ✅',
      database: 'PostgreSQL ✅',
      cache: 'Redis ✅',
      payment: 'JazzCash ✅',
      location: 'PostGIS ✅',
      chat: 'Real-time Chat ✅',
      admin: 'Admin Dashboard ✅',
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);

export default router;
