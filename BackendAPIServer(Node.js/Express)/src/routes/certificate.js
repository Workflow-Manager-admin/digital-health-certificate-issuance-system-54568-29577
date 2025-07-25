const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { certificates, applications, users } = require('../dummydb');
const { generateCertificatePDF } = require('../utils/pdf');
const router = express.Router();
const QRCode = require('qrcode');

/**
 * PUBLIC_INTERFACE
 * Doctor/Admin: Issue certificate (must be linked to approved application).
 */
router.post('/issue', authenticateJWT, authorizeRoles('doctor', 'admin'), async (req, res, next) => {
  try {
    const { applicationId } = req.body;
    const app = applications.find(a => a.id === applicationId);
    if (!app || app.status !== 'approved')
      return res.status(400).json({ message: 'Application not approved or not found' });
    // Ensure one certificate per application
    if (certificates.find(c => c.applicationId === applicationId))
      return res.status(409).json({ message: 'Certificate already issued' });

    const patient = users.find(u => u.id === app.patientId && u.role === 'patient');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const certId = uuidv4();
    const certData = {
      id: certId,
      patientId: patient.id,
      patientName: patient.fullName,
      type: app.type,
      applicationId,
      issuerId: req.user.id,
      issuedAt: new Date(),
      details: app.data,
      status: "issued"
    };
    certificates.push(certData);
    app.status = "cert_issued";

    res.json(certData);
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Get all certificates (doctor/admin = all; patient = own)
 */
router.get('/', authenticateJWT, (req, res, next) => {
  try {
    if (req.user.role === 'doctor' || req.user.role === 'admin') {
      res.json(certificates);
    } else {
      res.json(certificates.filter(c => c.patientId === req.user.id));
    }
  } catch (err) { next(err); }
});

/**
 * PUBLIC_INTERFACE
 * Download certificate as PDF (with QR) by certificate id (if permitted).
 */
router.get('/:id/download', authenticateJWT, async (req, res, next) => {
  try {
    const cert = certificates.find(c => c.id === req.params.id);
    if (!cert)
      return res.status(404).json({ message: 'Certificate not found' });

    // Access allowed: patient, admin, doctor
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'doctor' &&
      cert.patientId !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Generate QR code (URL to verify page /api/verify/:certificateId)
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/verify/${cert.id}`;
    const qrData = await QRCode.toDataURL(verifyUrl);

    res.setHeader('Content-disposition', `attachment; filename="${cert.id}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    const docStream = await generateCertificatePDF(cert, qrData);
    docStream.pipe(res);
    docStream.end();
  } catch (err) { next(err); }
});

module.exports = router;
