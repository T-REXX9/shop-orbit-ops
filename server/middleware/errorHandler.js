import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error:', err);

  // Handle SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json(
      errorResponse('Duplicate entry. This record already exists.')
    );
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json(
      errorResponse('Invalid reference. The referenced record does not exist.')
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      errorResponse('Validation failed', err.errors)
    );
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      errorResponse('File size too large. Maximum size is 5MB.')
    );
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json(
      errorResponse('Unexpected file field.')
    );
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  const response = errorResponse(message);
  
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

// Not found handler
export function notFoundHandler(req, res) {
  res.status(404).json(
    errorResponse(`Route ${req.method} ${req.path} not found`)
  );
}
