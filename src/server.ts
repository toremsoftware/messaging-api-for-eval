import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from './config';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const { PORT } = config;
const { JWT_SECRET } = config;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

// Middleware to make socket IO available in routes
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Messaging API for Evaluation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      messages: {
        send_text: 'POST /api/messages/send-text',
        send_image: 'POST /api/messages/send-image',
        get_messages: 'GET /api/messages'
      }
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (data: any) => {
    console.log('User joined chat:', data);
    socket.join('chat-room');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Middleware for not found routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Route ${req.originalUrl} does not exist`
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Control panel: http://localhost:${PORT}`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`💬 Messaging endpoints: http://localhost:${PORT}/api/messages`);
});

export { app, io, JWT_SECRET };
