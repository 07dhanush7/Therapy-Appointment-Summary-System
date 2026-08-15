/**
 * Custom application error class for throwing errors with specific HTTP status codes.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express centralized error handling middleware.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Map file upload errors to correct status codes
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Image size exceeds the 5 MB limit';
  } else if (message && (message.includes('Invalid file type') || message.includes('Only PNG, JPG, JPEG, and WEBP'))) {
    statusCode = 415;
  }

  // Log the error for internal visibility
  console.error(`[API Error] ${req.method} ${req.originalUrl} -> Status ${statusCode}: ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
}

module.exports = {
  AppError,
  errorHandler
};
