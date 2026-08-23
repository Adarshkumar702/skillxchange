import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { ChatService } from '../services/chatService';

const chatService = new ChatService();

export function setupSocketIO(io: SocketIOServer) {
  // Socket auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    try {
      const payload = verifyAccessToken(token as string);
      (socket as any).userId = payload.userId;
      (socket as any).email = payload.email;
      return next();
    } catch {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`Socket connected: ${socket.id} (User: ${userId})`);

    // Join personal user room for direct notification push
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined room conversation:${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send Real-Time Chat Message
    socket.on('send_message', async (data: { conversationId: string; content: string; mediaUrl?: string }) => {
      try {
        const message = await chatService.sendMessage(userId, data.conversationId, data.content, data.mediaUrl);
        // Broadcast to conversation room
        io.to(`conversation:${data.conversationId}`).emit('new_message', message);
      } catch (err: any) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // Typing Indicators
    socket.on('typing_start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user_typing', { userId, conversationId: data.conversationId });
    });

    socket.on('typing_stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', { userId, conversationId: data.conversationId });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
