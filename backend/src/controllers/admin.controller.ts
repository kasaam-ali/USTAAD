import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User, Worker, Booking, Review } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import sequelize from '../config/database';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Total users
    const totalUsers = await User.count();
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalWorkers = await User.count({ where: { role: 'worker' } });

    // Total bookings
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const completedBookings = await Booking.count({ where: { status: 'completed' } });

    // Revenue
    const totalRevenue = await Booking.sum('final_price', {
      where: { status: 'completed', payment_status: 'paid' },
    });

    // Recent users
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'full_name', 'phone', 'role', 'created_at'],
    });

    // Recent bookings
    const recentBookings = await Booking.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['full_name', 'phone'],
        },
        {
          model: User,
          as: 'worker',
          attributes: ['full_name', 'phone'],
        },
      ],
    });

    // Top workers
    const topWorkers = await Worker.findAll({
      limit: 10,
      order: [
        ['rating', 'DESC'],
        ['completed_jobs', 'DESC'],
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'phone'],
        },
      ],
    });

    res.status(200).json(
      ApiResponse.success('Dashboard stats retrieved successfully', {
        stats: {
          totalUsers,
          totalCustomers,
          totalWorkers,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue: totalRevenue || 0,
        },
        recentUsers,
        recentBookings,
        topWorkers,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json(
      ApiResponse.success('Users retrieved successfully', users, {
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

export const verifyWorker = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { worker_id } = req.params;

    const worker = await Worker.findByPk(worker_id);

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    await worker.update({ cnic_verified: true });

    const user = await User.findByPk(worker.user_id);
    if (user) {
      await user.update({ is_verified: true });
    }

    res.status(200).json(
      ApiResponse.success('Worker verified successfully', worker)
    );
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update({ is_active: false });

    res.status(200).json(
      ApiResponse.success('User deactivated successfully')
    );
  } catch (error) {
    next(error);
  }
};
