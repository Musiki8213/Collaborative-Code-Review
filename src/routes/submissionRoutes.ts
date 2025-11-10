import express from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, title, code } = req.body;
    const user = (req as any).user;

    if (!project_id || !title || !code) {
      return res.status(400).json({ error: 'Project, title, and code are required.' });
    }

    const result = await pool.query(
      `INSERT INTO submissions (project_id, submitter_id, title, code)
       VALUES ($1, $2, $3, $4)
       RETURNING id, project_id, submitter_id, title, code, status, created_at`,
      [project_id, user.id, title, code]
    );

    res.status(201).json({ message: 'Submission created!', submission: result.rows[0] });
  } catch (err) {
    console.error('Error creating submission:', err);
    res.status(500).json({ error: 'Server error while creating submission.' });
  }
});


router.get('/project/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    const result = await pool.query(
      `SELECT s.*, u.name AS submitter_name
       FROM submissions s
       JOIN users u ON s.submitter_id = u.id
       WHERE s.project_id = $1
       ORDER BY s.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Server error while fetching submissions.' });
  }
});

export default router;
