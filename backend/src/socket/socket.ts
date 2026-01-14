import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util';
import { env } from '../config/env';
import { messageHandler } from './handlers/message.handler';
import { notificationHandler } from './handlers/notification.handler';
import { prisma } from '../config/database';
import type { SocketUser } from './socket.type';


declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

const onlineUsers = new Map<string, string>(); 


type AuthSocket = Socket & { user: SocketUser };



export const initSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { username: true, email: true, role: true },
      });
      
      socket.user = {
        userId: payload.userId,
        username: user!.username,
        email: user!.email,
        role: user!.role,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    if (!socket.user) return;

    const authSocket = socket as AuthSocket; 
    const userId = authSocket.user.userId;


    console.log(`User connected: ${userId} (${socket.id})`);

    onlineUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);

    socket.emit('online_users', Array.from(onlineUsers.keys()));

    io.emit('user_online', { userId });

    messageHandler(io, authSocket);
    notificationHandler(io,authSocket);

    socket.on('disconnect', () => {
      console.log(` User disconnected: ${userId} (${socket.id})`);

      onlineUsers.delete(userId);

      io.emit('user_offline', { userId });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  setInterval(() => {
    io.emit('ping');
  }, 30000); 

  return io;
};




export const getUserSocketId = (userId: string): string | undefined => {
  return onlineUsers.get(userId);
};



export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};



export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

export default initSocket;