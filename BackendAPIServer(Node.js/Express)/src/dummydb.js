/**
 * In-memory/dummy storage for users, applications, certificates, notifications, and uploads.
 * For demo and development purposes only.
 */

const { v4: uuidv4 } = require('uuid');

/** Dummy users */
const users = [
  {
    id: uuidv4(),
    username: 'patient1',
    password: '$2a$08$examplehash1234567890patientsample', // will replace with hashed on registration
    role: 'patient',
    fullName: 'John Doe',
    email: 'patient1@example.com'
  },
  {
    id: uuidv4(),
    username: 'doctor1',
    password: '$2a$08$examplehash1234567890doctorsample',
    role: 'doctor',
    fullName: 'Dr. Jane Health',
    email: 'doctor1@example.com'
  },
  {
    id: uuidv4(),
    username: 'admin1',
    password: '$2a$08$examplehashadmin1234567890sample',
    role: 'admin',
    fullName: 'Admin User',
    email: 'admin1@example.com'
  }
];

/** Application forms (one per patient/certificate request) */
const applications = [];

/** Issued certificates */
const certificates = [];

/** Notifications queue -- userId, type, content, read/unread status */
const notifications = [];

/** Uploaded files are stored as memory blobs (in a real system this would be to S3/FS etc.) */
const uploads = [];

// PUBLIC_INTERFACE
module.exports = {
  users,
  applications,
  certificates,
  notifications,
  uploads
};
