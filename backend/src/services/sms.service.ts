import twilio from 'twilio';
import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Twilio Configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID &&
                     process.env.TWILIO_AUTH_TOKEN &&
                     process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// MSG91 Configuration (Pakistan SMS Service)
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'USTAAD';
const MSG91_ROUTE = process.env.MSG91_ROUTE || '4';

export const sendOTPViaTwilio = async (phone: string, otp: string): Promise<boolean> => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured, skipping SMS');
      console.log(`📱 [DEV MODE] OTP for ${phone}: ${otp}`);
      return true;
    }

    const message = await twilioClient.messages.create({
      body: `Your Ustaad verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+92${phone}`,
    });

    logger.info(`SMS sent via Twilio: ${message.sid}`);
    return true;
  } catch (error: any) {
    logger.error('Twilio SMS error:', error);
    return false;
  }
};

export const sendOTPViaMSG91 = async (phone: string, otp: string): Promise<boolean> => {
  try {
    if (!MSG91_AUTH_KEY) {
      logger.warn('MSG91 not configured, skipping SMS');
      console.log(`📱 [DEV MODE] OTP for ${phone}: ${otp}`);
      return true;
    }

    const message = `Your Ustaad verification code is: ${otp}. Valid for 10 minutes.`;

    const response = await axios.get('https://api.msg91.com/api/sendhttp.php', {
      params: {
        authkey: MSG91_AUTH_KEY,
        mobiles: `92${phone}`,
        message: message,
        sender: MSG91_SENDER_ID,
        route: MSG91_ROUTE,
        country: '92',
      },
    });

    logger.info(`SMS sent via MSG91: ${response.data}`);
    return true;
  } catch (error: any) {
    logger.error('MSG91 SMS error:', error);
    return false;
  }
};

export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  // Try MSG91 first (better for Pakistan), fallback to Twilio
  if (MSG91_AUTH_KEY) {
    return sendOTPViaMSG91(phone, otp);
  } else if (twilioClient) {
    return sendOTPViaTwilio(phone, otp);
  } else {
    // Development mode - just log the OTP
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`${'='.repeat(50)}\n`);
    return true;
  }
};

export const sendBookingNotification = async (
  phone: string,
  workerName: string,
  date: string
): Promise<boolean> => {
  try {
    const message = `Assalam o Alaikum! ${workerName} ne aapki booking accept kar li hai. Date: ${date}. Ustaad App`;

    if (MSG91_AUTH_KEY) {
      await axios.get('https://api.msg91.com/api/sendhttp.php', {
        params: {
          authkey: MSG91_AUTH_KEY,
          mobiles: `92${phone}`,
          message: message,
          sender: MSG91_SENDER_ID,
          route: MSG91_ROUTE,
          country: '92',
        },
      });
    } else {
      console.log(`📱 Notification for ${phone}: ${message}`);
    }

    return true;
  } catch (error) {
    logger.error('Notification SMS error:', error);
    return false;
  }
};
