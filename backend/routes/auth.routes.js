const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Generar token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query(
      'INSERT INTO users (id, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, hashedPassword, firstName, lastName, role || 'user']
    );

    const token = generateToken(id, role || 'user');

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id, email, firstName, lastName, role: role || 'user' }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, email, first_name, last_name, role, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;