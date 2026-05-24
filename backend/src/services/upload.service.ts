import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  keyFilename: process.env.GCS_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || 'ustaad-uploads');

// Multer configuration
const multerStorage = multer.memoryStorage();

const multerFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
});

export const uploadToGCS = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  try {
    // Optimize image
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const filename = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    // Upload to GCS
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        logger.error('GCS upload error:', error);
        reject(ApiError.internal('Failed to upload file'));
      });

      blobStream.on('finish', async () => {
        // Make file public
        await blob.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        resolve(publicUrl);
      });

      blobStream.end(optimizedBuffer);
    });
  } catch (error) {
    logger.error('Image processing error:', error);
    throw ApiError.internal('Failed to process image');
  }
};

export const uploadMultipleToGCS = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToGCS(file, folder));
  return Promise.all(uploadPromises);
};

export const deleteFromGCS = async (fileUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const filename = fileUrl.split(`${bucket.name}/`)[1];

    if (filename) {
      await bucket.file(filename).delete();
      logger.info(`File deleted: ${filename}`);
    }
  } catch (error) {
    logger.error('GCS delete error:', error);
    // Don't throw error, just log it
  }
};

// Local storage fallback (for development)
export const uploadToLocal = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  try {
    const fs = require('fs').promises;
    const uploadDir = path.join(process.cwd(), 'public', folder);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Optimize image
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await fs.writeFile(filepath, optimizedBuffer);

    // Return public URL
    return `/uploads/${filename}`;
  } catch (error) {
    logger.error('Local upload error:', error);
    throw ApiError.internal('Failed to upload file');
  }
};

// Main upload function (uses GCS in production, local in development)
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> => {
  if (process.env.NODE_ENV === 'production' && process.env.GCS_BUCKET_NAME) {
    return uploadToGCS(file, folder);
  } else {
    return uploadToLocal(file, folder);
  }
};

export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadFile(file, folder));
  return Promise.all(uploadPromises);
};
