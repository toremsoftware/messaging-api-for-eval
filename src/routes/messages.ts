import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import { addMessage, getMessages } from '../utils/database';
import { SendTextRequest, SendImageRequest, ApiResponse, Message } from '../types';

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'uploads/');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Helper function to send automatic response after 2 seconds
const sendAutoResponse = (
  io: Server,
  messageType: 'text' | 'image',
  replyMessage: Message
): void => {
  setTimeout(() => {
    const autoMessage = addMessage({
      text: messageType === 'text' ? 'Texto recibido' : 'Imagen recibida',
      type: 'text',
      userId: 'system',
      isAutoResponse: true,
      replyTo: replyMessage.id
    });

    // Emit automatic message via WebSocket
    io.to('chat-room').emit('new-message', autoMessage);
  }, 2000);
};

// POST /api/messages/send-text - Send text message
router.post(
  '/send-text',
  verifyToken,
  (
    req: Request<{}, ApiResponse<Message>, SendTextRequest>,
    res: Response<ApiResponse<Message>>
  ) => {
    try {
      const { text } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          message: 'Invalid user token'
        });
        return;
      }

      // Validate that text is not empty
      if (!text || text.trim() === '') {
        res.status(400).json({
          error: 'Text required',
          message: 'Message cannot be empty'
        });
        return;
      }

      // Save message to database
      const message = addMessage({
        text: text.trim(),
        type: 'text',
        userId,
        isAutoResponse: false
      });

      // Emit message via WebSocket immediately
      req.io?.to('chat-room').emit('new-message', message);

      // Schedule automatic response
      if (req.io) {
        sendAutoResponse(req.io, 'text', message);
      }

      res.status(201).json({
        data: message
      });
    } catch (error) {
      console.error('Error sending text message:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error sending message'
      });
    }
  }
);

// POST /api/messages/send-image - Send image message
router.post(
  '/send-image',
  verifyToken,
  upload.single('image'),
  (
    req: Request<{}, ApiResponse<Message>, SendImageRequest>,
    res: Response<ApiResponse<Message>>
  ) => {
    try {
      const userId = req.user?.userId;
      const { file } = req;

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          message: 'Invalid user token'
        });
        return;
      }

      // Validate that an image has been uploaded
      if (!file) {
        res.status(400).json({
          error: 'Image required',
          message: 'Must upload an image file'
        });
        return;
      }

      // Save message to database
      const message = addMessage({
        text: req.body.caption || '', // Optional caption
        type: 'image',
        userId,
        imageUrl: `/uploads/${file.filename}`,
        imageName: file.originalname,
        imageSize: file.size,
        isAutoResponse: false
      });

      // Emit message via WebSocket immediately
      req.io?.to('chat-room').emit('new-message', message);

      // Schedule automatic response
      if (req.io) {
        sendAutoResponse(req.io, 'image', message);
      }

      res.status(201).json({
        data: message
      });
    } catch (error) {
      console.error('Error sending image:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error sending image'
      });
    }
  }
);

// GET /api/messages - Get chat messages with offset
router.get('/', verifyToken, (req: Request, res: Response) => {
  try {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;

    // Validate parameters
    if (offset < 0) {
      res.status(400).json({
        error: 'Invalid offset',
        message: 'Offset must be greater than or equal to 0'
      });
      return;
    }

    if (limit < 1 || limit > 50) {
      res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 50'
      });
      return;
    }

    const result = getMessages(offset, limit);

    res.status(200).json({
      elements: result.elements,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error retrieving messages'
    });
  }
});

// GET /api/messages/health - Health check for testing
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'messaging-api'
  });
});

export default router;
