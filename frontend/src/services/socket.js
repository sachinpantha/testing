import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      console.log('Connecting to Socket.IO server:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: false,
        timeout: 20000,
        forceNew: true
      });
      
      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket.id);
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();