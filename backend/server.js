import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import healthRoutes from './routes/health.js';
import voiceRoutes from './routes/voice.js';
import interventionRoutes from './routes/intervention.js';
import dataRoutes from './routes/data.js';
import aiRoutes from './routes/ai.js';
import { processAudioStream } from './controllers/aiController.js';

const app = express();
const PORT = process.env.PORT || 4242;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/intervention', interventionRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Branch Backend API is running' });
});

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();
const activeEditors = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins collaboration session
  socket.on('join-session', (userData) => {
    const { userId, userName, projectId } = userData;
    
    connectedUsers.set(socket.id, {
      userId,
      userName,
      projectId,
      joinedAt: new Date()
    });

    // Broadcast user joined to all clients
    io.emit('user-joined', {
      userId,
      userName,
      socketId: socket.id,
      onlineUsers: Array.from(connectedUsers.values())
    });

    console.log(`User ${userName} joined session ${projectId}`);
  });

  // Handle code changes
  socket.on('code-change', (data) => {
    const { filePath, content, changeType, userId } = data;
    
    // Broadcast code change to all other clients
    socket.broadcast.emit('code-change', {
      filePath,
      content,
      changeType,
      userId,
      timestamp: new Date()
    });

    // Update active editors
    activeEditors.set(filePath, {
      userId,
      userName: connectedUsers.get(socket.id)?.userName,
      lastEdit: new Date()
    });
  });

  // Handle cursor position
  socket.on('cursor-position', (data) => {
    const { filePath, line, column, userId } = data;
    
    socket.broadcast.emit('cursor-position', {
      filePath,
      line,
      column,
      userId,
      userName: connectedUsers.get(socket.id)?.userName,
      socketId: socket.id
    });
  });

  // Handle user typing status
  socket.on('typing', (data) => {
    const { filePath, isTyping } = data;
    
    socket.broadcast.emit('typing', {
      filePath,
      isTyping,
      userId: connectedUsers.get(socket.id)?.userId,
      userName: connectedUsers.get(socket.id)?.userName
    });
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { message, userId, userName } = data;
    
    io.emit('chat-message', {
      message,
      userId,
      userName,
      timestamp: new Date()
    });
  });
  
  // Handle AI call audio stream
  socket.on('audio-stream', async (data) => {
    const { callId, audioData } = data;
    
    try {
      // Forward audio data to AI service for processing
      console.log(`Received audio stream for call ${callId}`);
      
      // Process audio stream using AI controller
      const result = await processAudioStream(callId, audioData);
      
      // Send AI response back to client
      socket.emit('ai-response', {
        callId: callId,
        audioData: result.audioData,
        text: result.text
      });
    } catch (error) {
      console.error('Error processing audio stream:', error);
      // Send error response to client
      socket.emit('ai-response', {
        callId: callId,
        text: '抱歉，我在处理您的请求时遇到了问题。请稍后再试。'
      });
    }
  });
  
  // Handle AI call status updates
  socket.on('call-status', (data) => {
    const { callId, status } = data;
    console.log(`Call ${callId} status updated to ${status}`);
    
    // Broadcast status update to all connected clients
    io.emit('call-status', {
      callId: callId,
      status: status,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      console.log(`User ${user.userName} disconnected`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.id);
      
      // Remove user from active editors
      for (const [filePath, editor] of activeEditors) {
        if (editor.userId === user.userId) {
          activeEditors.delete(filePath);
        }
      }
      
      // Broadcast user left to all clients
      io.emit('user-left', {
        userId: user.userId,
        userName: user.userName,
        onlineUsers: Array.from(connectedUsers.values())
      });
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready for real-time collaboration`);
});

export default app;