const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-super-secret';
const UserModel = require('../models/userModel');

// ── Google / Mock Login ────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;

    let email = 'user@example.com';
    let name = 'Nexus User';

    if (token === 'mock-google-jwt-token') {
      email = 'demo.investor@nexus.com';
      name = 'Demo Account';
    } else {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || 'Google User';
      }
    }

    const dbUser = await UserModel.upsertUser(email, name, role || 'Nomad');
    const payload = { id: dbUser.id, email: dbUser.email, name: dbUser.full_name, role: dbUser.role };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token: jwtToken, user: payload });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Internal Authentication Error' });
  }
};

// ── Email Registration ─────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const dbUser = await UserModel.createUser(email, name, hashedPassword, role || 'Nomad');
    const payload = { id: dbUser.id, email: dbUser.email, name: dbUser.full_name, role: dbUser.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: payload });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// ── Email Login ───────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const dbUser = await UserModel.getUserByEmail(email);

    if (!dbUser) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    // Support accounts created via Google (no password hash)
    if (!dbUser.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please use "Continue with Google".' });
    }

    const valid = await bcrypt.compare(password, dbUser.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const payload = { id: dbUser.id, email: dbUser.email, name: dbUser.full_name, role: dbUser.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
