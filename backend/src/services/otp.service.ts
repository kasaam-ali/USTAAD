import { OTP } from '../models';
import { sendOTP } from './sms.service';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTP = async (
  phone: string,
  purpose: 'registration' | 'login' | 'password_reset'
): Promise<string> => {
  try {
    // Delete any existing unused OTPs for this phone
    await OTP.destroy({
      where: {
        phone,
        is_used: false,
      },
    });

    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await OTP.create({
      phone,
      otp,
      purpose,
      expires_at: expiresAt,
    });

    // Send OTP via SMS
    const smsSent = await sendOTP(phone, otp);

    if (!smsSent) {
      logger.warn(`Failed to send OTP to ${phone}, but OTP created in DB`);
    }

    logger.info(`OTP created for ${phone}, purpose: ${purpose}`);
    return otp;
  } catch (error) {
    logger.error('Error creating OTP:', error);
    throw ApiError.internal('Failed to create OTP');
  }
};

export const verifyOTP = async (
  phone: string,
  otp: string,
  purpose: 'registration' | 'login' | 'password_reset'
): Promise<boolean> => {
  try {
    const otpRecord = await OTP.findOne({
      where: {
        phone,
        otp,
        purpose,
        is_used: false,
      },
      order: [['created_at', 'DESC']],
    });

    if (!otpRecord) {
      throw ApiError.badRequest('Invalid OTP');
    }

    if (otpRecord.isExpired()) {
      throw ApiError.badRequest('OTP has expired');
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    logger.info(`OTP verified successfully for ${phone}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error verifying OTP:', error);
    throw ApiError.internal('Failed to verify OTP');
  }
};

export const resendOTP = async (
  phone: string,
  purpose: 'registration' | 'login' | 'password_reset'
): Promise<string> => {
  // Check if last OTP was sent less than 1 minute ago
  const lastOTP = await OTP.findOne({
    where: { phone, purpose },
    order: [['created_at', 'DESC']],
  });

  if (lastOTP) {
    const timeSinceLastOTP = Date.now() - lastOTP.created_at.getTime();
    const oneMinute = 60 * 1000;

    if (timeSinceLastOTP < oneMinute) {
      throw ApiError.tooManyRequests('Please wait before requesting another OTP');
    }
  }

  return createOTP(phone, purpose);
};
