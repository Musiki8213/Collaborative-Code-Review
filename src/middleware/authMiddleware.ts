import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token part

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    (req as any).user = decoded;

    next(); 
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
