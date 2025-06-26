import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const createRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    message: {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      });
    },
    keyGenerator: (req) => {
      // Use IP address as the key for rate limiting
      return req.ip || req.connection.remoteAddress;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
    ...options,
  });
};

// Different rate limits for different endpoints
export const generalRateLimit = createRateLimit();

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes for expensive operations
});

export const badgeRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // 200 requests per 5 minutes for badges (they're cached)
});