import fs from 'fs';
import path from 'path';
import { Database, User, Message, MessagesResponse } from '../types';

// Path to database file should be relative to working directory, not compiled file
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

// Initial database structure
const initialData: Database = {
  users: [
    {
      id: '1',
      username: 'testuser',
      password: 'testpass123'
    }
  ],
  messages: []
};

// Create database file if it doesn't exist
const initializeDB = (): void => {
  const dataDir = path.dirname(DB_FILE);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

// Read database
const readDB = (): Database => {
  try {
    initializeDB();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as Database;
  } catch (error) {
    console.error('Error reading database:', error);
    return initialData;
  }
};

// Write to database
const writeDB = (data: Database): boolean => {
  try {
    initializeDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Get user by username
const getUserByUsername = (username: string): User | undefined => {
  const db = readDB();
  return db.users.find((user) => user.username === username);
};

// Add message
const addMessage = (message: Omit<Message, 'id' | 'timestamp'>): Message => {
  const db = readDB();
  const newMessage: Message = {
    id: Date.now().toString(),
    ...message,
    timestamp: new Date().toISOString()
  };

  db.messages.unshift(newMessage); // Add to beginning for newest to oldest order
  writeDB(db);
  return newMessage;
};

// Get paginated messages with offset
const getMessages = (offset: number = 0, limit: number = 10): MessagesResponse => {
  const db = readDB();
  const startIndex = offset;
  const endIndex = offset + limit;

  const elements = db.messages.slice(startIndex, endIndex);
  const total = db.messages.length;

  return {
    elements,
    pagination: {
      offset,
      limit,
      totalMessages: total,
      hasMore: endIndex < total
    }
  };
};

// Get all messages (for testing)
const getAllMessages = (): Message[] => {
  const db = readDB();
  return db.messages;
};

export {
  readDB,
  writeDB,
  getUserByUsername,
  addMessage,
  getMessages,
  getAllMessages,
  initializeDB
};
