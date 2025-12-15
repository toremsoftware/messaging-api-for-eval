export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Message {
  id: string;
  text: string;
  type: 'text' | 'image';
  username: string;
  timestamp: string;
  isAutoResponse: boolean;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  replyTo?: string;
}

export interface Database {
  users: User[];
  messages: Message[];
}

export interface MessagesPagination {
  offset: number;
  limit: number;
  totalMessages: number;
  hasMore: boolean;
}

export interface MessagesResponse {
  elements: Message[];
  pagination: MessagesPagination;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: {
    username: string;
  };
}

export interface SendTextRequest {
  text: string;
}

export interface SendImageRequest {
  caption?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface JWTPayload {
  username: string;
  timestamp: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JWTPayload;
  io?: any;
}

// Extiende el objeto Request de Express para incluir nuestras propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      io?: any;
    }
  }
}
