import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  githubToken: process.env.GITHUB_TOKEN,
  nodeEnv: process.env.NODE_ENV || 'development',
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour default
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  },
  github: {
    apiUrl: 'https://api.github.com',
    maxReposPerUser: 1000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
};

export const validateConfig = () => {
  if (!config.githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
};