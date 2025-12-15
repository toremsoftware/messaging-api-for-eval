import express, { Request, Response } from 'express';
import { LoginRequest, LoginResponse, ApiResponse } from '../types';
import { generateToken, verifyToken } from '../middleware/auth';

const router = express.Router();

const FIXED_CREDENTIALS = {
  username: 'testuser',
  password: 'testpass123'
};

// POST /api/auth/login
router.post(
  '/login',
  (
    req: Request<{}, LoginResponse | ApiResponse, LoginRequest>,
    res: Response<LoginResponse | ApiResponse>
  ) => {
    try {
      const { username, password } = req.body;

      // Validate that required fields are sent
      if (!username || !password) {
        res.status(400).json({
          error: 'Required fields',
          message: 'Username and password are required'
        });
        return;
      }

      // Check credentials
      if (username !== FIXED_CREDENTIALS.username || password !== FIXED_CREDENTIALS.password) {
        res.status(403).json({
          error: 'Invalid credentials',
          message: 'Incorrect username or password'
        });
        return;
      }

      // Generate JWT
      const token = generateToken(username);

      res.status(200).json({
        token,
        user: {
          username
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error processing login'
      });
    }
  }
);

// GET /api/auth/verify - Verify token (optional for testing)
router.get('/verify', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({
    user: req.user
  });
});

export default router;
