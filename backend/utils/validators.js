/**
 * Validation utilities for DME API
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

const validateString = (str, minLength = 1, maxLength = 255) => {
  return typeof str === 'string' && str.trim().length >= minLength && str.length <= maxLength;
};

const validateRole = (role) => {
  const validRoles = ['admin', 'medecin', 'patient', 'infirmier', 'laboratoire'];
  return validRoles.includes(role);
};

const validateMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateString,
  validateRole,
  validateMongoId,
  sanitizeInput
};
