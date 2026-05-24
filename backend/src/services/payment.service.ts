import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';
import ApiError from '../utils/ApiError';

// JazzCash Configuration
const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID || '';
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD || '';
const JAZZCASH_INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT || '';
const JAZZCASH_RETURN_URL = process.env.JAZZCASH_RETURN_URL || '';

interface PaymentRequest {
  amount: number;
  orderId: string;
  description: string;
  customerPhone: string;
  customerEmail?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
}

export const generateJazzCashHash = (data: any): string => {
  const sortedKeys = Object.keys(data).sort();
  let hashString = JAZZCASH_INTEGRITY_SALT + '&';

  sortedKeys.forEach((key) => {
    if (data[key] !== '' && data[key] !== null) {
      hashString += data[key] + '&';
    }
  });

  hashString = hashString.slice(0, -1);

  return crypto
    .createHmac('sha256', JAZZCASH_INTEGRITY_SALT)
    .update(hashString)
    .digest('hex')
    .toUpperCase();
};

export const initiateJazzCashPayment = async (
  request: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    if (!JAZZCASH_MERCHANT_ID) {
      logger.warn('JazzCash not configured');
      return {
        success: false,
        message: 'Payment gateway not configured',
      };
    }

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const expiryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0];

    const paymentData = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_Password: JAZZCASH_PASSWORD,
      pp_TxnRefNo: `T${timestamp}`,
      pp_Amount: (request.amount * 100).toString(), // Convert to paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: timestamp,
      pp_BillReference: request.orderId,
      pp_Description: request.description,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: JAZZCASH_RETURN_URL,
      pp_SecureHash: '',
      ppmpf_1: request.customerPhone,
      ppmpf_2: request.customerEmail || '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: '',
    };

    // Generate secure hash
    paymentData.pp_SecureHash = generateJazzCashHash(paymentData);

    // JazzCash API endpoint
    const response = await axios.post(
      'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
      new URLSearchParams(paymentData as any),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    logger.info(`JazzCash payment initiated: ${paymentData.pp_TxnRefNo}`);

    return {
      success: true,
      transactionId: paymentData.pp_TxnRefNo,
      paymentUrl: response.data.paymentUrl || response.request.res.responseUrl,
      message: 'Payment initiated successfully',
    };
  } catch (error: any) {
    logger.error('JazzCash payment error:', error);
    throw ApiError.internal('Failed to initiate payment');
  }
};

export const verifyJazzCashPayment = (responseData: any): boolean => {
  try {
    const receivedHash = responseData.pp_SecureHash;
    delete responseData.pp_SecureHash;

    const calculatedHash = generateJazzCashHash(responseData);

    return receivedHash === calculatedHash && responseData.pp_ResponseCode === '000';
  } catch (error) {
    logger.error('Payment verification error:', error);
    return false;
  }
};

// EasyPaisa Integration (Similar structure)
export const initiateEasyPaisaPayment = async (
  request: PaymentRequest
): Promise<PaymentResponse> => {
  // EasyPaisa API integration
  logger.info('EasyPaisa payment not yet implemented');
  return {
    success: false,
    message: 'EasyPaisa integration coming soon',
  };
};

// Generic payment interface
export const initiatePayment = async (
  request: PaymentRequest,
  method: 'jazzcash' | 'easypaisa' = 'jazzcash'
): Promise<PaymentResponse> => {
  if (method === 'jazzcash') {
    return initiateJazzCashPayment(request);
  } else {
    return initiateEasyPaisaPayment(request);
  }
};
