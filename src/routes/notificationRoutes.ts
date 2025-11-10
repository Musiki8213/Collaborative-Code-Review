import express from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();


router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error while fetching notifications.' });
  }
});

export default router;
