const express = require('express');
const { notifications } = require('../dummydb');
const { authenticateJWT } = require('../middleware/auth');

/**
 * Notification API routes (stub/simple polling for now).
 */
const router = express.Router();

/**
 * PUBLIC_INTERFACE
 * Get all notifications for current user.
 */
router.get('/', authenticateJWT, (req, res, next) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user.id);
    res.json(userNotifications);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Mark a notification as read.
 */
router.post('/:id/read', authenticateJWT, (req, res, next) => {
  try {
    const n = notifications.find(ntf => ntf.id === req.params.id && ntf.userId === req.user.id);
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    n.read = true;
    res.json(n);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Simulate a test notification (for testing frontend polling, etc).
 */
router.post('/simulate', authenticateJWT, (req, res, next) => {
  try {
    const n = {
      id: require('uuid').v4(),
      userId: req.user.id,
      type: 'test',
      content: req.body.content || 'This is a test notification!',
      read: false,
      ts: new Date()
    };
    notifications.push(n);
    res.json(n);
  } catch (err) { next(err); }
});

module.exports = router;
