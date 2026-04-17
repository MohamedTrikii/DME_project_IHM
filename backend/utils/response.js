/**
 * API Response utilities for consistent error and success responses
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sendError = (res, statusCode, message, details = null) => {
  const error = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    error.details = details;
  }

  return res.status(statusCode).json(error);
};

const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const handleError = (error, res) => {
  console.error('[Error]', error);

  // Known error types
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message);
  }

  if (error.name === 'ValidationError') {
    const details = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
    return sendError(res, 400, 'Erreur de validation', details);
  }

  if (error.name === 'CastError') {
    return sendError(res, 400, 'ID invalide');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendError(res, 409, `${field} est déjà utilisé`);
  }

  // Generic error
  return sendError(res, 500, 'Erreur serveur interne');
};

module.exports = {
  AppError,
  sendError,
  sendSuccess,
  handleError
};
