/**
 * Validates memory submission data
 * @param {Object} data - { from: string, message: string }
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateMemory(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }

  const { from, message } = data;

  // Validate 'from' field
  if (!from || typeof from !== 'string') {
    errors.push('Name is required');
  } else if (from.trim().length === 0) {
    errors.push('Name cannot be empty');
  } else if (from.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Validate 'message' field
  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
  } else if (message.trim().length === 0) {
    errors.push('Message cannot be empty');
  } else if (message.length > 10000) {
    errors.push('Message must be less than 10,000 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  validateMemory,
  sanitizeText
};
