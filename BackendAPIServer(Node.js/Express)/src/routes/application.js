const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { applications, users, notifications } = require('../dummydb');

/**
 * Certificate Application routes.
 * - Patients can create/view their applications.
 * - Doctors/Admins can list/review/approve/reject.
 */
const router = express.Router();

/**
 * PUBLIC_INTERFACE
 * Patients: submit new certificate application.
 */
router.post('/', authenticateJWT, authorizeRoles('patient'), (req, res, next) => {
  try {
    const { type, data, documents } = req.body; // data: {reason, details, ...}
    if (!type || !data) return res.status(400).json({ message: 'Type and data required' });
    const appId = uuidv4();

    const application = {
      id: appId,
      patientId: req.user.id,
      patientName: req.user.fullName,
      type,
      data,
      status: 'submitted',
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: documents || []
    };

    applications.push(application);
    notifications.push({
      id: uuidv4(),
      userId: req.user.id,
      type: 'info',
      content: `Application ${appId} submitted.`,
      read: false,
      ts: new Date()
    });

    res.json(application);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Patients: view all their submitted applications.
 */
router.get('/mine', authenticateJWT, authorizeRoles('patient'), (req, res, next) => {
  try {
    const userApps = applications.filter(a => a.patientId === req.user.id);
    res.json(userApps);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Doctors/Admins: list all pending applications
 */
router.get('/', authenticateJWT, authorizeRoles('doctor', 'admin'), (req, res, next) => {
  try {
    const filtered = applications.filter(a => a.status === 'submitted');
    res.json(filtered);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Doctors/Admins: review single application by ID.
 */
router.get('/:id', authenticateJWT, authorizeRoles('doctor', 'admin'), (req, res, next) => {
  try {
    const app = applications.find(a => a.id === req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Doctors/Admins: approve/reject application.
 * Expects: { status: "approved"|"rejected", notes: string }
 */
router.patch('/:id', authenticateJWT, authorizeRoles('doctor', 'admin'), (req, res, next) => {
  try {
    const app = applications.find(a => a.id === req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status !== 'submitted') return res.status(400).json({ message: 'Already processed' });

    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    app.status = status;
    app.assignedTo = req.user.id;
    app.notes = notes || '';
    app.updatedAt = new Date();

    notifications.push({
      id: uuidv4(),
      userId: app.patientId,
      type: 'decision',
      content: `Your application ${app.id} was ${status}.`,
      read: false,
      ts: new Date()
    });

    res.json(app);
  } catch (err) { next(err); }
});

module.exports = router;
