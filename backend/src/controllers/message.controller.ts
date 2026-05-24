import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import Message from '../models/Message';
import { Booking } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { booking_id, message, message_type = 'text' } = req.body;

    // Verify booking exists and user is part of it
    const booking = await Booking.findByPk(booking_id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (
      booking.customer_id !== req.user.id &&
      booking.worker_id !== req.user.id
    ) {
      throw ApiError.forbidden('You are not part of this booking');
    }

    // Create message
    const newMessage = await Message.create({
      booking_id,
      sender_id: req.user.id,
      message,
      message_type,
    });

    // Emit via Socket.io (handled in socket service)
    const io = req.app.get('io');
    io.to(`booking:${booking_id}`).emit('new_message', {
      ...newMessage.toJSON(),
      sender: {
        id: req.user.id,
        name: req.user.full_name,
      },
    });

    res.status(201).json(
      ApiResponse.created('Message sent successfully', newMessage)
    );
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { booking_id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verify user is part of booking
    const booking = await Booking.findByPk(booking_id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (
      booking.customer_id !== req.user.id &&
      booking.worker_id !== req.user.id
    ) {
      throw ApiError.forbidden('Access denied');
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: { booking_id },
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    // Mark messages as read
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          booking_id,
          sender_id: { [Op.ne]: req.user.id },
          is_read: false,
        },
      }
    );

    res.status(200).json(
      ApiResponse.success('Messages retrieved successfully', messages.reverse(), {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      })
    );
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { booking_id } = req.params;

    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          booking_id,
          sender_id: { [Op.ne]: req.user.id },
          is_read: false,
        },
      }
    );

    res.status(200).json(
      ApiResponse.success('Messages marked as read')
    );
  } catch (error) {
    next(error);
  }
};
