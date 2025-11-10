import express from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { submission_id, content, line_number } = req.body;
    const user = (req as any).user;

    if (!submission_id || !content) {
      return res.status(400).json({ error: 'Submission ID and content are required.' });
    }

    const result = await pool.query(
      `INSERT INTO comments (submission_id, user_id, content, line_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, submission_id, user_id, content, line_number, created_at`,
      [submission_id, user.id, content, line_number || null]
    );

    res.status(201).json({ message: 'Comment added!', comment: result.rows[0] });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Server error while adding comment.' });
  }
});


router.get('/submission/:id', authenticateToken, async (req, res) => {
  try {
    const submissionId = req.params.id;

    const result = await pool.query(
      `SELECT c.*, u.name AS commenter_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.submission_id = $1
       ORDER BY c.created_at ASC`,
      [submissionId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Server error while fetching comments.' });
  }
});

export default router;
