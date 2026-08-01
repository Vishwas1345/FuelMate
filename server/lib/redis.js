import Redis from 'ioredis';
import logger from '../utils/logger.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  // Retry strategy: back off exponentially, give up after ~30s total
  retryStrategy(times) {
    if (times > 10) {
      logger.error('❌ Redis: max retry attempts reached, giving up');
      return null; // stop retrying
    }
    const delay = Math.min(times * 200, 3000);
    logger.warn(`Redis: retrying connection (attempt ${times}) in ${delay}ms`);
    return delay;
  },

  // Don't crash the process on connection failure — Redis is a cache layer,
  // the app can still function (with degraded performance) without it
  enableOfflineQueue: false,

  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

// Attempt connection at startup
try {
  await redis.connect();
} catch (err) {
  logger.error('Redis initial connection failed — app will run without Redis cache', {
    error: err.message,
  });
}

export default redis;
