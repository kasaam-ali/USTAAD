import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User, Worker } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import sequelize from '../config/database';

export const searchWorkers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      trade,
      city,
      area,
      min_rating,
      max_price,
      latitude,
      longitude,
      radius = 10, // km
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      is_available: true,
    };

    if (trade) {
      whereClause.trade = trade;
    }

    if (city) {
      whereClause.city = city;
    }

    if (area) {
      whereClause.area = area;
    }

    if (min_rating) {
      whereClause.rating = {
        [Op.gte]: Number(min_rating),
      };
    }

    if (max_price) {
      whereClause.hourly_rate = {
        [Op.lte]: Number(max_price),
      };
    }

    // Location-based search (if coordinates provided)
    let distanceQuery = '';
    if (latitude && longitude) {
      distanceQuery = `
        , (
          6371 * acos(
            cos(radians(${latitude})) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(${longitude})) +
            sin(radians(${latitude})) *
            sin(radians(latitude))
          )
        ) AS distance
      `;

      whereClause.latitude = { [Op.ne]: null };
      whereClause.longitude = { [Op.ne]: null };
    }

    const { count, rows: workers } = await Worker.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url', 'is_verified'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [
        ['rating', 'DESC'],
        ['completed_jobs', 'DESC'],
      ],
      attributes: {
        include: distanceQuery ? [
          [
            sequelize.literal(`(
              6371 * acos(
                cos(radians(${latitude})) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(${longitude})) +
                sin(radians(${latitude})) *
                sin(radians(latitude))
              )
            )`),
            'distance'
          ]
        ] : [],
      },
    });

    // Filter by radius if location provided
    let filteredWorkers = workers;
    if (latitude && longitude) {
      filteredWorkers = workers.filter((w: any) => {
        return !w.dataValues.distance || w.dataValues.distance <= Number(radius);
      });
    }

    res.status(200).json(
      ApiResponse.success('Workers retrieved successfully', filteredWorkers, {
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

export const getWorkerById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const worker = await Worker.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'phone', 'profile_photo_url', 'is_verified'],
        },
      ],
    });

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    res.status(200).json(
      ApiResponse.success('Worker retrieved successfully', worker)
    );
  } catch (error) {
    next(error);
  }
};

export const updateWorkerProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      description,
      min_charge,
      hourly_rate,
      visit_charge,
      service_areas,
      is_available,
      portfolio_photos,
    } = req.body;

    const worker = await Worker.findOne({
      where: { user_id: req.user.id },
    });

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    await worker.update({
      description: description || worker.description,
      min_charge: min_charge || worker.min_charge,
      hourly_rate: hourly_rate || worker.hourly_rate,
      visit_charge: visit_charge || worker.visit_charge,
      service_areas: service_areas || worker.service_areas,
      is_available: is_available !== undefined ? is_available : worker.is_available,
      portfolio_photos: portfolio_photos || worker.portfolio_photos,
    });

    res.status(200).json(
      ApiResponse.success('Worker profile updated successfully', worker)
    );
  } catch (error) {
    next(error);
  }
};

export const getWorkerStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const worker = await Worker.findOne({
      where: { user_id: req.user.id },
    });

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    // Get booking stats
    const { Booking } = require('../models');

    const totalBookings = await Booking.count({
      where: { worker_id: req.user.id },
    });

    const completedBookings = await Booking.count({
      where: {
        worker_id: req.user.id,
        status: 'completed',
      },
    });

    const pendingBookings = await Booking.count({
      where: {
        worker_id: req.user.id,
        status: 'pending',
      },
    });

    const totalEarnings = await Booking.sum('final_price', {
      where: {
        worker_id: req.user.id,
        status: 'completed',
        payment_status: 'paid',
      },
    });

    res.status(200).json(
      ApiResponse.success('Worker stats retrieved successfully', {
        rating: worker.rating,
        total_ratings: worker.total_ratings,
        completed_jobs: worker.completed_jobs,
        total_bookings: totalBookings,
        completed_bookings: completedBookings,
        pending_bookings: pendingBookings,
        total_earnings: totalEarnings || 0,
        is_available: worker.is_available,
      })
    );
  } catch (error) {
    next(error);
  }
};
