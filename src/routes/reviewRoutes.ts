import express from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();


router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const user = (req as any).user;
    const { comment } = req.body;

    await pool.query(
      `INSERT INTO reviews (submission_id, reviewer_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [submissionId, user.id, 'approved', comment || null]
    );

    await pool.query(
      `UPDATE submissions SET status = 'approved' WHERE id = $1`,
      [submissionId]
    );

    res.json({ message: 'Submission approved!' });
  } catch (err) {
    console.error('Error approving submission:', err);
    res.status(500).json({ error: 'Server error while approving submission.' });
  }
});


router.post('/:id/request-changes', authenticateToken, async (req, res) => {
  try {
    const submissionId = req.params.id;
    const user = (req as any).user;
    const { comment } = req.body;

    await pool.query(
      `INSERT INTO reviews (submission_id, reviewer_id, action, comment)
       VALUES ($1, $2, $3, $4)`,
      [submissionId, user.id, 'changes_requested', comment || null]
    );

    await pool.query(
      `UPDATE submissions SET status = 'changes_requested' WHERE id = $1`,
      [submissionId]
    );

    res.json({ message: 'Changes requested for submission!' });
  } catch (err) {
    console.error('Error requesting changes:', err);
    res.status(500).json({ error: 'Server error while requesting changes.' });
  }
});


router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const submissionId = req.params.id;

    const result = await pool.query(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.submission_id = $1
       ORDER BY r.created_at ASC`,
      [submissionId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching review history:', err);
    res.status(500).json({ error: 'Server error while fetching review history.' });
  }
});

export default router;
