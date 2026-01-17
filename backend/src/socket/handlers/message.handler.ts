import { Server, Socket } from 'socket.io';
import { prisma } from '../../config/database';
import { getUserSocketId } from '../socket';



interface SendMessagePayload {
  receiverId: string;
  content: string;
}

interface TypingPayload {
  receiverId: string;
}

interface MarkAsReadPayload {
  messageId: string;
}


export interface AuthenticatedUser {
    userId: string;       
    username: string;     
    email: string;       
    role: 'USER' | 'OWNER' | 'ADMIN'; 
    avatar?: string;      
    shopId?: string;      
  }


export interface AuthenticatedSocket extends Socket{
    user:AuthenticatedUser
}


export const messageHandler = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user!.userId;


  socket.on('send_message', async (payload: SendMessagePayload) => {
    try {
      const { receiverId, content } = payload;

      if (!content || !receiverId) {
        return socket.emit('error', { message: 'incorrect password' });
      }

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true },
      });

      if (!receiver) {
        return socket.emit('error', { message: 'receiver not found' });
      }

      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      socket.emit('message_sent', message);

      const receiverSocketId = getUserSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', message);
      }

      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE',
          title: 'New message',
          message: `${message.sender.username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          link: `/messages/${userId}`,
          metadata: { messageId: message.id, senderId: userId },
        },
      });

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', {
          type: 'MESSAGE',
          title: 'New message',
          from: message.sender.username,
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'error for sending message' });
    }
  });

 

  socket.on('get_messages', async (payload: { withUserId: string; page?: number; limit?: number }) => {
    try {
      const { withUserId, page = 1, limit = 50 } = payload;
      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      socket.emit('messages_history', {
        messages: messages.reverse(),
        page,
        hasMore: messages.length === limit,
      });
    } catch (error) {
      console.error('Get messages error:', error);
      socket.emit('error', { message: 'error for get message' });
    }
  });

 
  socket.on('get_conversations', async () => {
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const conversationsMap = new Map();

      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          const unreadCount = await prisma.message.count({
            where: {
              senderId: otherUserId,
              receiverId: userId,
              read: false,
            },
          });

          conversationsMap.set(otherUserId, {
            user: message.senderId === userId ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount,
          });
        }
      }

      const conversations = Array.from(conversationsMap.values());

      socket.emit('conversations_list', conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      socket.emit('error', { message: 'error for gettin chats' });
    }
  });

 
  socket.on('mark_as_read', async (payload: MarkAsReadPayload) => {
    try {
      const { messageId } = payload;

      await prisma.message.update({
        where: { id: messageId, receiverId: userId },
        data: { read: true },
      });

      socket.emit('message_read', { messageId });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  
  socket.on('mark_conversation_read', async (payload: { withUserId: string }) => {
    try {
      const { withUserId } = payload;

      await prisma.message.updateMany({
        where: {
          senderId: withUserId,
          receiverId: userId,
          read: false,
        },
        data: { read: true },
      });

      socket.emit('conversation_read', { withUserId });

      const senderSocketId = getUserSocketId(withUserId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read_by', { userId });
      }
    } catch (error) {
      console.error('Mark conversation read error:', error);
    }
  });


  socket.on('typing_start', (payload: TypingPayload) => {
    const { receiverId } = payload;
    const receiverSocketId = getUserSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { userId });
    }
  });

  socket.on('typing_stop', (payload: TypingPayload) => {
    const { receiverId } = payload;
    const receiverSocketId = getUserSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stopped_typing', { userId });
    }
  });
};