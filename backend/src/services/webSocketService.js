// backend/src/services/webSocketService.js
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const allowedOrigins = ['http://localhost:3000']; // Add any other allowed origins as needed

const verifyClient = ({ origin }, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(true);
  } else {
    callback(false, 403, 'Origin not allowed');
  }
};

class WebSocketService {
  constructor() {
    this.clients = new Set();
    this.messages = [];
    this.MAX_MESSAGES = 200;
  }

  initialize(server) {
    try {
      this.wss = new WebSocketServer({ 
        server,
        verifyClient
      });
      
      console.log('WebSocket server initialized');

      this.wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection attempt from:', req.socket.remoteAddress);
        this.handleConnection(ws, req);
      });

      this.wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
      });

    } catch (error) {
      console.error('Error initializing WebSocket server:', error);
    }
  }

  handleConnection(ws, req) {
    try {
      this.clients.add(ws);
      console.log('Client connected. Total clients:', this.clients.size);
      
      // Send message history to new client
      this.sendMessageHistory(ws);

      // Update online count for all clients
      this.broadcastOnlineCount();

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
        this.broadcastOnlineCount();
      });

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
        this.clients.delete(ws);
        this.broadcastOnlineCount();
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to chat server'
      }));

    } catch (error) {
      console.error('Error in handleConnection:', error);
    }
  }

  sendMessageHistory(ws) {
    try {
      ws.send(JSON.stringify({
        type: 'history',
        messages: this.messages
      }));
    } catch (error) {
      console.error('Error sending message history:', error);
    }
  }

  handleMessage(message) {
    try {
      // Add timestamp if not present
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      };

      // Add message to history
      this.messages.push(messageWithTimestamp);
      
      // Keep only last MAX_MESSAGES
      if (this.messages.length > this.MAX_MESSAGES) {
        this.messages = this.messages.slice(-this.MAX_MESSAGES);
      }

      // Broadcast to all clients
      this.broadcast({
        type: 'message',
        message: messageWithTimestamp
      });
    } catch (error) {
      console.error('Error in handleMessage:', error);
    }
  }

  broadcast(data) {
    const messageString = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(messageString);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  broadcastOnlineCount() {
    this.broadcast({
      type: 'onlineCount',
      count: this.clients.size
    });
  }
}

export default new WebSocketService();