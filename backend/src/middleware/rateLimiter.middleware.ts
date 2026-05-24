import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import redisClient from '../config/redis';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Redis store disabled for now - works without it
  // store: process.env.REDIS_HOST
  //   ? new RedisStore({
  //       // @ts-ignore
  //       client: redisClient,
  //       prefix: 'rl:api:',
  //     })
  //   : undefined,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  // store: process.env.REDIS_HOST
  //   ? new RedisStore({
  //       // @ts-ignore
  //       client: redisClient,
  //       prefix: 'rl:auth:',
  //     })
  //   : undefined,
});

// OTP rate limiter
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 OTP requests per minute
  message: 'Too many OTP requests, please wait before trying again.',
  // store: process.env.REDIS_HOST
  //   ? new RedisStore({
  //       // @ts-ignore
  //       client: redisClient,
  //       prefix: 'rl:otp:',
  //     })
  //   : undefined,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many uploads, please try again later.',
  // store: process.env.REDIS_HOST
  //   ? new RedisStore({
  //       // @ts-ignore
  //       client: redisClient,
  //       prefix: 'rl:upload:',
  //     })
  //   : undefined,
});
