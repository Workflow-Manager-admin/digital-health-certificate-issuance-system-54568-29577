const PDFDocument = require('pdfkit');

/**
 * PUBLIC_INTERFACE
 * Generate a health certificate PDF as a readable stream, embedding QR code.
 * @param {object} cert Certificate object
 * @param {string} qrData QR code DataURL (base64 image)
 * @returns {PDFDocument} readable stream
 */
function generateCertificatePDF(cert, qrData) {
  const doc = new PDFDocument();
  doc.fontSize(20).text('Digital Health Certificate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate ID: ${cert.id}`);
  doc.text(`Patient: ${cert.patientName}`);
  doc.text(`Certificate Type: ${cert.type}`);
  doc.text(`Issued At: ${new Date(cert.issuedAt).toLocaleString()}`);
  doc.moveDown().text('Details:', { underline: true });
  Object.keys(cert.details).forEach(k => {
    doc.text(` - ${k}: ${cert.details[k]}`);
  });

  doc.moveDown().text('Scan QR to verify:');
  // Embed QR
  if (qrData && qrData.startsWith('data:image/png;base64,')) {
    const img = Buffer.from(qrData.split(',')[1], 'base64');
    doc.image(img, { width: 100 });
  }

  doc.moveDown().text('Powered by Digital Health Certificate Issuance System');
  return doc;
}

module.exports = { generateCertificatePDF };
