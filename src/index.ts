import express from 'express';
import dotenv from 'dotenv';
import './config/db';
import rootRoutes from './routes/rootRoutes';
import authRoutes from './routes/authRoutes';
import  pool  from './config/db';



dotenv.config();

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 4000;


app.use('/api', rootRoutes);        
app.use('/api/auth', authRoutes);   
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
