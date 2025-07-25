const express = require('express');
const { certificates } = require('../dummydb');

/**
 * PUBLIC_INTERFACE
 * Public certificate verification endpoint.
 * GET /api/verify/:certificateId => limited cert info if found, else 404.
 */
const router = express.Router();

router.get('/:id', (req, res) => {
  const cert = certificates.find(c => c.id === req.params.id);
  if (!cert) {
    return res.status(404).json({ verified: false, message: 'Certificate not found' });
  }
  // Only return non-sensitive details!
  res.json({
    verified: true,
    id: cert.id,
    patientName: cert.patientName,
    type: cert.type,
    issuedAt: cert.issuedAt,
    // No personal identifiers, details, or application linkage
    status: cert.status
  });
});

module.exports = router;
