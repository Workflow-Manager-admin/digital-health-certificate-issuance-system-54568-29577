const jwt = require('jsonwebtoken');

/**
 * Express middleware for authenticating JWT Bearer tokens (patients, doctors, admins).
 * Sets req.user if valid.
 */
// PUBLIC_INTERFACE
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token' });
  }
  const token = authHeader.substring(7);
  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

/**
 * Express middleware for verifying user's role.
 * Usage: authorizeRoles('doctor'), authorizeRoles('admin', 'patient')
 */
// PUBLIC_INTERFACE
function authorizeRoles(...permittedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    if (!permittedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Role not permitted.' });
    }
    next();
  };
}

module.exports = {
  authenticateJWT,
  authorizeRoles
};
