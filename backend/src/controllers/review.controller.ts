import { Response, NextFunction } from 'express';
import { Review, Booking, User, Worker } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { booking_id, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findByPk(booking_id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.customer_id !== req.user.id) {
      throw ApiError.forbidden('You can only review your own bookings');
    }

    if (booking.status !== 'completed') {
      throw ApiError.badRequest('Can only review completed bookings');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ where: { booking_id } });
    if (existingReview) {
      throw ApiError.conflict('Review already exists for this booking');
    }

    // Create review
    const review = await Review.create({
      booking_id,
      customer_id: req.user.id,
      worker_id: booking.worker_id,
      rating,
      comment,
    });

    // Update worker's rating
    const worker = await Worker.findOne({ where: { user_id: booking.worker_id } });

    if (worker) {
      const newTotalRatings = worker.total_ratings + 1;
      const newRating = ((worker.rating * worker.total_ratings) + rating) / newTotalRatings;

      await worker.update({
        rating: parseFloat(newRating.toFixed(2)),
        total_ratings: newTotalRatings,
      });
    }

    logger.info(`Review created: ${review.id} for booking ${booking_id}`);

    res.status(201).json(
      ApiResponse.created('Review submitted successfully', review)
    );
  } catch (error) {
    next(error);
  }
};

export const getWorkerReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { worker_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { worker_id },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'full_name', 'profile_photo_url'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    // Calculate rating distribution
    const ratingDistribution = await Review.findAll({
      where: { worker_id },
      attributes: [
        'rating',
        [Review.sequelize!.fn('COUNT', Review.sequelize!.col('rating')), 'count'],
      ],
      group: ['rating'],
      raw: true,
    });

    res.status(200).json(
      ApiResponse.success('Reviews retrieved successfully', reviews, {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
        ratingDistribution,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.customer_id !== req.user.id) {
      throw ApiError.forbidden('You can only update your own reviews');
    }

    const oldRating = review.rating;

    await review.update({
      rating: rating || review.rating,
      comment: comment !== undefined ? comment : review.comment,
    });

    // Update worker's rating if rating changed
    if (rating && rating !== oldRating) {
      const worker = await Worker.findOne({ where: { user_id: review.worker_id } });

      if (worker) {
        const totalRatings = worker.total_ratings;
        const currentTotal = worker.rating * totalRatings;
        const newTotal = currentTotal - oldRating + rating;
        const newRating = newTotal / totalRatings;

        await worker.update({
          rating: parseFloat(newRating.toFixed(2)),
        });
      }
    }

    res.status(200).json(
      ApiResponse.success('Review updated successfully', review)
    );
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.customer_id !== req.user.id && req.user.role !== 'admin') {
      throw ApiError.forbidden('Access denied');
    }

    // Update worker's rating
    const worker = await Worker.findOne({ where: { user_id: review.worker_id } });

    if (worker && worker.total_ratings > 1) {
      const newTotalRatings = worker.total_ratings - 1;
      const currentTotal = worker.rating * worker.total_ratings;
      const newTotal = currentTotal - review.rating;
      const newRating = newTotal / newTotalRatings;

      await worker.update({
        rating: parseFloat(newRating.toFixed(2)),
        total_ratings: newTotalRatings,
      });
    } else if (worker && worker.total_ratings === 1) {
      await worker.update({
        rating: 5.0,
        total_ratings: 0,
      });
    }

    await review.destroy();

    res.status(200).json(
      ApiResponse.success('Review deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
