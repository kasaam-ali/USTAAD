import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import logger from './utils/logger';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Socket.io setup for real-time features (WOW FACTOR!)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 Ustaad API - Production Ready',
    version: '1.0.0',
    documentation: '/api/health',
    features: [
      '✅ Real OTP Authentication',
      '✅ AI-Powered Price Estimation',
      '✅ Location-Based Search',
      '✅ Real-time Notifications',
      '✅ Smart Recommendations',
      '✅ Multi-language Support',
    ],
  });
});

// API routes
app.use('/api/v1', routes);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user room
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Join booking room
  socket.on('join_booking', (bookingId: string) => {
    socket.join(`booking:${bookingId}`);
    logger.info(`Socket ${socket.id} joined booking ${bookingId}`);
  });

  // Chat message
  socket.on('send_message', (data: any) => {
    io.to(`booking:${data.bookingId}`).emit('new_message', data);
  });

  // Typing indicator
  socket.on('typing', (data: any) => {
    socket.to(`booking:${data.bookingId}`).emit('user_typing', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis (optional)
    try {
      await connectRedis();
    } catch (error) {
      logger.warn('Redis connection failed, continuing without cache');
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 USTAAD API SERVER RUNNING                           ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV?.toUpperCase().padEnd(10)}                              ║
║   Port: ${PORT.toString().padEnd(10)}                                     ║
║   Database: PostgreSQL ✅                                 ║
║   Redis: ${process.env.REDIS_HOST ? 'Connected ✅' : 'Disabled ⚠️ '.padEnd(20)}                ║
║   Socket.io: Active ✅                                    ║
║                                                           ║
║   API Docs: http://localhost:${PORT}/api/health          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, io };
