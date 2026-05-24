import { Response, NextFunction } from 'express';
import { Booking, User, Worker } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { estimatePriceWithAI } from '../services/ai.service';
import { sendBookingNotification } from '../services/sms.service';
import logger from '../utils/logger';

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      worker_id,
      description,
      scheduled_date,
      time_preference,
      address,
      city,
      area,
      latitude,
      longitude,
    } = req.body;

    // Verify worker exists
    const worker = await Worker.findOne({
      where: { user_id: worker_id },
      include: [{ model: User, as: 'user' }],
    });

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    if (!worker.is_available) {
      throw ApiError.badRequest('Worker is not available');
    }

    // AI-powered price estimation (WOW FACTOR!)
    const estimatedPrice = await estimatePriceWithAI({
      trade: worker.trade,
      description,
      hourlyRate: worker.hourly_rate,
      minCharge: worker.min_charge,
      visitCharge: worker.visit_charge,
    });

    // Create booking
    const booking = await Booking.create({
      customer_id: req.user.id,
      worker_id,
      description,
      scheduled_date,
      time_preference,
      address,
      city,
      area,
      latitude,
      longitude,
      estimated_price: estimatedPrice,
      status: 'pending',
    });

    // Send notification to worker
    const workerUser = await User.findByPk(worker_id);
    if (workerUser && workerUser.phone) {
      await sendBookingNotification(
        workerUser.phone,
        req.user.full_name,
        new Date(scheduled_date).toLocaleDateString()
      );
    }

    logger.info(`Booking created: ${booking.id}`);

    res.status(201).json(
      ApiResponse.created('Booking created successfully', booking)
    );
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    // Filter by role
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'worker') {
      whereClause.worker_id = req.user.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url'],
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(
      ApiResponse.success('Bookings retrieved successfully', bookings, {
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

export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url'],
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url'],
        },
      ],
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Check authorization
    if (
      booking.customer_id !== req.user.id &&
      booking.worker_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      throw ApiError.forbidden('Access denied');
    }

    res.status(200).json(
      ApiResponse.success('Booking retrieved successfully', booking)
    );
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, final_price, worker_notes, cancellation_reason } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Authorization check
    if (req.user.role === 'worker' && booking.worker_id !== req.user.id) {
      throw ApiError.forbidden('Access denied');
    }

    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      throw ApiError.forbidden('Access denied');
    }

    // Update booking
    const updateData: any = { status };

    if (final_price) updateData.final_price = final_price;
    if (worker_notes) updateData.worker_notes = worker_notes;
    if (cancellation_reason) updateData.cancellation_reason = cancellation_reason;

    if (status === 'completed') {
      updateData.completed_at = new Date();

      // Update worker stats
      const worker = await Worker.findOne({ where: { user_id: booking.worker_id } });
      if (worker) {
        await worker.update({
          completed_jobs: worker.completed_jobs + 1,
        });
      }
    }

    await booking.update(updateData);

    logger.info(`Booking ${id} status updated to ${status}`);

    res.status(200).json(
      ApiResponse.success('Booking updated successfully', booking)
    );
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Check if user is authorized
    if (
      booking.customer_id !== req.user.id &&
      booking.worker_id !== req.user.id
    ) {
      throw ApiError.forbidden('Access denied');
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw ApiError.badRequest('Booking cannot be cancelled');
    }

    await booking.update({
      status: 'cancelled',
      cancellation_reason,
    });

    logger.info(`Booking ${id} cancelled by user ${req.user.id}`);

    res.status(200).json(
      ApiResponse.success('Booking cancelled successfully', booking)
    );
  } catch (error) {
    next(error);
  }
};
