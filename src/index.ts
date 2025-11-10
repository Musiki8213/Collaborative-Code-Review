import express from 'express';
import dotenv from 'dotenv';
import './config/db';
import rootRoutes from './routes/rootRoutes';
import authRoutes from './routes/authRoutes';
import pool from './config/db';
import { authenticateToken } from './middleware/authMiddleware'; 
import projectRoutes from './routes/projectRoutes';
import submissionRoutes from './routes/submissionRoutes';
import commentRoutes from './routes/commentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorMiddleware';



dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use('/api', rootRoutes);
app.use('/api/auth', authRoutes);


app.get('/api/test-db', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users;');
    res.json({
      message: 'Database connection successful!',
      currentUser: (req as any).user, 
      users: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', notificationRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
