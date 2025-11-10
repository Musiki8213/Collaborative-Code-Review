import express from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = (req as any).user; 

    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, owner_id, created_at`,
      [name, description, user.id]
    );

    res.status(201).json({
      message: 'Project created successfully!',
      project: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error while creating project.' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS owner_name
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error while fetching projects.' });
  }
});

router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, project_id, user_id, role, added_at`,
      [projectId, user_id, role || 'reviewer']
    );

    res.status(201).json({ message: 'Member added successfully!', member: result.rows[0] });
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ error: 'Server error while adding member.' });
  }
});


router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.params.userId;

    await pool.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    res.json({ message: 'Member removed successfully!' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Server error while removing member.' });
  }
});

router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    const submissionsResult = await pool.query(
      `SELECT COUNT(*)::int AS total,
              SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END)::int AS approved,
              SUM(CASE WHEN status='changes_requested' THEN 1 ELSE 0 END)::int AS changes_requested
       FROM submissions
       WHERE project_id = $1`,
      [projectId]
    );


    const reviewTimeResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (r.created_at - s.created_at))/3600)::numeric(10,2) AS avg_review_hours
       FROM reviews r
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.project_id = $1`,
      [projectId]
    );

    const activeReviewersResult = await pool.query(
      `SELECT u.name, COUNT(*) AS review_count
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       JOIN submissions s ON r.submission_id = s.id
       WHERE s.project_id = $1
       GROUP BY u.name
       ORDER BY review_count DESC
       LIMIT 5`,
      [projectId]
    );

    res.json({
      total_submissions: submissionsResult.rows[0].total,
      approved: submissionsResult.rows[0].approved,
      changes_requested: submissionsResult.rows[0].changes_requested,
      avg_review_hours: reviewTimeResult.rows[0].avg_review_hours,
      top_reviewers: activeReviewersResult.rows
    });

  } catch (err) {
    console.error('Error fetching project stats:', err);
    res.status(500).json({ error: 'Server error while fetching project stats.' });
  }
});


export default router;
