import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocketIO = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.info(`User ${socket.userId} joined their room`);
    }

    // Join booking room
    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.info(`User ${socket.userId} joined booking ${bookingId}`);
    });

    // Leave booking room
    socket.on('leave_booking', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
      logger.info(`User ${socket.userId} left booking ${bookingId}`);
    });

    // Chat message
    socket.on('send_message', async (data: {
      bookingId: string;
      message: string;
      timestamp: string;
    }) => {
      // Broadcast to all users in the booking room
      io.to(`booking:${data.bookingId}`).emit('new_message', {
        ...data,
        senderId: socket.userId,
        senderRole: socket.userRole,
      });

      logger.info(`Message sent in booking ${data.bookingId} by user ${socket.userId}`);
    });

    // Typing indicator
    socket.on('typing', (data: { bookingId: string; isTyping: boolean }) => {
      socket.to(`booking:${data.bookingId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Mark message as read
    socket.on('mark_read', (data: { bookingId: string; messageId: string }) => {
      socket.to(`booking:${data.bookingId}`).emit('message_read', {
        messageId: data.messageId,
        readBy: socket.userId,
      });
    });

    // Worker location update (for real-time tracking)
    socket.on('update_location', (data: { latitude: number; longitude: number }) => {
      if (socket.userRole === 'worker') {
        io.emit('worker_location_updated', {
          workerId: socket.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  });

  return io;
};

// Helper functions to emit events from controllers
export const emitBookingUpdate = (io: Server, bookingId: string, data: any) => {
  io.to(`booking:${bookingId}`).emit('booking_updated', data);
};

export const emitNotification = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const emitBookingStatusChange = (
  io: Server,
  bookingId: string,
  customerId: string,
  workerId: string,
  status: string
) => {
  const notification = {
    type: 'booking_status',
    bookingId,
    status,
    timestamp: new Date().toISOString(),
  };

  // Notify both customer and worker
  io.to(`user:${customerId}`).emit('notification', notification);
  io.to(`user:${workerId}`).emit('notification', notification);
  io.to(`booking:${bookingId}`).emit('booking_status_changed', { status });
};
