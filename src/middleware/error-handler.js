export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // GitHub API rate limit error
  if (err.response && err.response.status === 403 && err.resetTime) {
    return res.status(429).json({
      error: 'GitHub API Rate Limit Exceeded',
      message: `GitHub API rate limit exceeded. Resets at ${err.resetTime.toISOString()}`,
      retryAfter: Math.ceil((err.resetTime - new Date()) / 1000),
    });
  }

  // GitHub API errors
  if (err.response && err.response.status === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'The requested resource was not found',
    });
  }

  if (err.response && err.response.status === 401) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing GitHub token',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  // Timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    return res.status(408).json({
      error: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      'GET /api/user/:username': 'Get user code statistics',
      'GET /api/user/:username/badge': 'Get user badge SVG',
      'GET /api/user/:username/card': 'Get user stats card SVG',
      'GET /api/repo/:owner/:repo': 'Get repository statistics',
      'GET /health': 'Health check endpoint',
    },
  });
};