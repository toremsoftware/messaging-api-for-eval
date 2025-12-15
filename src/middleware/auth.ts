import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types';
import { config } from '../config';

const { JWT_SECRET } = config;

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({
      error: 'Access token required',
      message: 'Must provide a valid token in Authorization header'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (_) {
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is not valid or has expired'
    });
  }
};

const generateToken = (username: string): string =>
  jwt.sign(
    {
      username,
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

export { verifyToken, generateToken };
