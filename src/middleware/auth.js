/**
 * Middleware to check if user is authenticated
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: 'Unauthorized. Please log in.'
  });
}

module.exports = {
  requireAuth
};
