import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadFile, uploadMultipleFiles } from '../services/upload.service';
import { User, Worker } from '../models';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

export const uploadProfilePhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Upload to cloud storage
    const photoUrl = await uploadFile(req.file, 'profiles');

    // Update user profile
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update({ profile_photo_url: photoUrl });

    res.status(200).json(
      ApiResponse.success('Profile photo uploaded successfully', {
        url: photoUrl,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const uploadPortfolioPhotos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw ApiError.badRequest('No files uploaded');
    }

    // Upload all photos
    const photoUrls = await uploadMultipleFiles(req.files, 'portfolio');

    // Update worker portfolio
    const worker = await Worker.findOne({ where: { user_id: req.user.id } });
    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    const portfolioPhotos = worker.portfolio_photos || [];
    const newPhotos = photoUrls.map((url, index) => ({
      url,
      caption: req.body.captions?.[index] || '',
    }));

    await worker.update({
      portfolio_photos: [...portfolioPhotos, ...newPhotos],
    });

    res.status(200).json(
      ApiResponse.success('Portfolio photos uploaded successfully', {
        photos: newPhotos,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const deletePortfolioPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { photoUrl } = req.body;

    const worker = await Worker.findOne({ where: { user_id: req.user.id } });
    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    const portfolioPhotos = worker.portfolio_photos || [];
    const updatedPhotos = portfolioPhotos.filter((photo: any) => photo.url !== photoUrl);

    await worker.update({ portfolio_photos: updatedPhotos });

    res.status(200).json(
      ApiResponse.success('Portfolio photo deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
