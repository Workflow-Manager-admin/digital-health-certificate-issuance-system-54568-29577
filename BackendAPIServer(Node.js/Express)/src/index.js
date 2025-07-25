const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const certificateRoutes = require('./routes/certificate');
const notificationRoutes = require('./routes/notification');
const verificationRoutes = require('./routes/verification');
const usersRoutes = require('./routes/users');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/users', usersRoutes);

// Simple health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// PUBLIC_INTERFACE
app.listen(PORT, () => {
  console.log(`Digital Health Certificate API listening on port ${PORT}`);
});

module.exports = app;
