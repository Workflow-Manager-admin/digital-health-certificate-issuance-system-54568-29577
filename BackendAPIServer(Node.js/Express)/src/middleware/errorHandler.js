/**
 * Catch-all error handling middleware for Express.
 */
// PUBLIC_INTERFACE
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}

module.exports = { errorHandler };
