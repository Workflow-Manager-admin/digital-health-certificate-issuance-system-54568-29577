const express = require('express');
const { users } = require('../dummydb');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * PUBLIC_INTERFACE
 * @api {get} /api/users Get all users (admin only)
 * @apiName GetUsers
 * @apiGroup Users
 *
 * Admin fetch-all-users route for admin dashboard.
 */
router.get('/', authenticateJWT, authorizeRoles('admin'), (req, res, next) => {
  try {
    // Avoid exposing passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
