import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateConfig } from './config/index.js';
import { generalRateLimit } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import apiRoutes from './routes/api.js';
import cacheService from './services/cache.js';

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline SVG
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Performance middleware
app.use(compression());

// Rate limiting
app.use(generalRateLimit);

// Body parsing (limited since we mainly serve GET requests)
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      healthy: cacheService.isHealthy(),
      stats: cacheService.getStats(),
    },
  };

  res.json(health);
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Profile Line of Code API',
    version: '1.0.0',
    description: 'Calculate total lines of code across GitHub repositories by programming language',
    documentation: {
      endpoints: {
        'GET /api/user/:username': {
          description: 'Get comprehensive code statistics for a GitHub user',
          parameters: {
            username: 'GitHub username',
            refresh: 'Optional query parameter to bypass cache',
          },
          example: '/api/user/octocat',
        },
        'GET /api/user/:username/badge': {
          description: 'Get SVG badge showing code statistics',
          parameters: {
            username: 'GitHub username',
            style: 'Badge style: total, language, repos (default: total)',
            language: 'Specific language name (required for language style)',
            theme: 'Badge theme (default: default)',
          },
          example: '/api/user/octocat/badge?style=total',
        },
        'GET /api/user/:username/card': {
          description: 'Get SVG stats card with detailed breakdown',
          parameters: {
            username: 'GitHub username',
            theme: 'Card theme (default: default)',
          },
          example: '/api/user/octocat/card',
        },
        'GET /api/repo/:owner/:repo': {
          description: 'Get code statistics for a specific repository',
          parameters: {
            owner: 'Repository owner',
            repo: 'Repository name',
            refresh: 'Optional query parameter to bypass cache',
          },
          example: '/api/repo/microsoft/vscode',
        },
        'GET /api/languages': {
          description: 'Get list of supported programming languages',
          example: '/api/languages',
        },
        'GET /api/rate-limit': {
          description: 'Check current rate limit status',
          example: '/api/rate-limit',
        },
        'GET /health': {
          description: 'Health check endpoint',
          example: '/health',
        },
      },
      usage: {
        'HTML Badge': '<img src="https://your-domain.com/api/user/username/badge" alt="Lines of Code"/>',
        'Markdown Badge': '![Lines of Code](https://your-domain.com/api/user/username/badge)',
        'Stats Card': '<img src="https://your-domain.com/api/user/username/card" alt="Code Statistics"/>',
      },
      features: [
        'Comprehensive language detection (50+ languages)',
        'Detailed line counting (code, comments, blank lines)',
        'Smart caching for performance',
        'Rate limiting protection',
        'SVG badge and card generation',
        'GitHub API integration',
        'Repository-level statistics',
      ],
      rateLimit: {
        general: `${config.rateLimit.max} requests per ${Math.floor(config.rateLimit.windowMs / 60000)} minutes`,
        strict: '30 requests per 15 minutes (for data endpoints)',
        badges: '200 requests per 5 minutes (for badge endpoints)',
      },
    },
    author: 'Profile Line Counter',
    repository: 'https://github.com/username/profile-line-of-code',
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// For serverless deployment (Vercel) vs traditional server (Railway)
if (process.env.VERCEL !== '1') {
  // Start server for local development
  const server = app.listen(config.port, () => {
    console.log(`🚀 Profile Line of Code API running on port ${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`⚡ Cache TTL: ${config.cache.ttl} seconds`);
    console.log(`🛡️  Rate limit: ${config.rateLimit.max} requests per ${Math.floor(config.rateLimit.windowMs / 60000)} minutes`);
    
    if (config.nodeEnv === 'development') {
      console.log(`🔗 API docs: http://localhost:${config.port}/`);
      console.log(`❤️  Health check: http://localhost:${config.port}/health`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('💤 Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('📴 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('💤 Process terminated');
      process.exit(0);
    });
  });
}

export default app;