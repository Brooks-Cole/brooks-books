import config from '../config/config.js';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000; 
    this.isConnecting = false;
  }

  connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const wsUrl = config.wsUrl;
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      // Check if wsUrl is defined
      if (!wsUrl) {
        console.error('WebSocket URL is not defined in config');
        this.isConnecting = false;
        return;
      }

      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        if (event.code !== 1000) { // Normal closure
          console.log('WebSocket connection closed:', event.code, event.reason);
          // Only attempt reconnect if it wasn't a normal closure
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (!this.isConnected()) {
        this.reconnectAttempts++;
        this.connect();
      }
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
  }

  addMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.add(handler);
    } else {
      console.error('Message handler must be a function');
    }
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  sendMessage(message) {
    if (!message) {
      console.warn('Attempted to send empty message');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

// Export the instance
export default websocketService;