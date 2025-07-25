const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../dummydb');

const router = express.Router();

/**
 * PUBLIC_INTERFACE
 * @api {post} /api/auth/register Register new patient
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, fullName, email } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    if (users.find(u => u.username === username))
      return res.status(409).json({ message: 'Username taken' });

    const hashed = await bcrypt.hash(password, 8);
    const newUser = {
      id: require('uuid').v4(),
      username, password: hashed,
      role: 'patient',
      fullName, email
    };
    users.push(newUser);

    res.json({ id: newUser.id, username: newUser.username, role: newUser.role });
  } catch (err) {
    next(err);
  }
});

/**
 * PUBLIC_INTERFACE
 * @api {post} /api/auth/login User login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const pwOk = await bcrypt.compare(password, user.password);
    if (!pwOk) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
