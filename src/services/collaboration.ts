import { io, Socket } from 'socket.io-client';

class CollaborationService {
  private socket: Socket | null = null;
  private userId: string;
  private userName: string;
  private projectId: string;
  private callbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.userId = this.generateUserId();
    this.userName = this.generateUserName();
    this.projectId = 'branch-emotional-support';
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserName(): string {
    const names = ['开发者', '程序员', '设计师', '产品经理', '测试工程师'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return `${randomName}_${Math.floor(Math.random() * 1000)}`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:4242', {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
          console.log('Connected to collaboration server');
          
          // Join collaboration session
          this.socket?.emit('join-session', {
            userId: this.userId,
            userName: this.userName,
            projectId: this.projectId
          });
          
          this.executeCallbacks('connected', { socketId: this.socket?.id });
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.executeCallbacks('error', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from collaboration server');
          this.executeCallbacks('disconnected', {});
        });

        // Listen for user joined events
        this.socket.on('user-joined', (data) => {
          console.log('User joined:', data);
          this.executeCallbacks('user-joined', data);
        });

        // Listen for user left events
        this.socket.on('user-left', (data) => {
          console.log('User left:', data);
          this.executeCallbacks('user-left', data);
        });

        // Listen for code changes
        this.socket.on('code-change', (data) => {
          console.log('Code change received:', data);
          this.executeCallbacks('code-change', data);
        });

        // Listen for cursor positions
        this.socket.on('cursor-position', (data) => {
          this.executeCallbacks('cursor-position', data);
        });

        // Listen for typing status
        this.socket.on('typing', (data) => {
          this.executeCallbacks('typing', data);
        });

        // Listen for chat messages
        this.socket.on('chat-message', (data) => {
          this.executeCallbacks('chat-message', data);
        });

      } catch (error) {
        console.error('Failed to connect:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private executeCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error executing callback for event ${event}:`, error);
        }
      });
    }
  }

  sendCodeChange(filePath: string, content: string, changeType: string): void {
    if (this.socket) {
      this.socket.emit('code-change', {
        filePath,
        content,
        changeType,
        userId: this.userId
      });
    }
  }

  sendCursorPosition(filePath: string, line: number, column: number): void {
    if (this.socket) {
      this.socket.emit('cursor-position', {
        filePath,
        line,
        column,
        userId: this.userId
      });
    }
  }

  sendTypingStatus(filePath: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', {
        filePath,
        isTyping
      });
    }
  }

  sendChatMessage(message: string): void {
    if (this.socket) {
      this.socket.emit('chat-message', {
        message,
        userId: this.userId,
        userName: this.userName
      });
    }
  }

  getUserId(): string {
    return this.userId;
  }

  getUserName(): string {
    return this.userName;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;