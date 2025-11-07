import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

const router = express.Router();
router.get('/test', (req, res) => {
  res.send('Auth routes are connected');
});


// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: result.rows[0],
      token
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user in the database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful!',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});


export default router;
