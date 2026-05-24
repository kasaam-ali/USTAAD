import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: any = null;
let isRedisConnected = false;

export const connectRedis = async (): Promise<void> => {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 3000,
        reconnectStrategy: false, // Disable auto-reconnect
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
    });

    client.on('error', () => {
      // Silently handle errors, don't spam logs
      isRedisConnected = false;
    });

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisConnected = true;
    });

    await client.connect();
    redisClient = client;
  } catch (error) {
    console.log('⚠️  Redis not available - Continuing without cache (development mode)');
    redisClient = null;
    isRedisConnected = false;
  }
};

export const getRedisClient = (): any => {
  return isRedisConnected ? redisClient : null;
};

export const isRedisAvailable = (): boolean => {
  return isRedisConnected && redisClient !== null;
};

export default redisClient;
