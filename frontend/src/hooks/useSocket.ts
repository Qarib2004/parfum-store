import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { Message, AppNotification } from '@/types';
import { useAppNotificationStore } from '@/store/notificationsStore';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addMessage, setUserTyping } = useMessageStore();
  const { addAppNotification, setUnreadCount } = useAppNotificationStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socketInstance = initSocket(accessToken);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketInstance.on('online_users', (users: string[]) => {
        setOnlineUsers(users);
      });

      socketInstance.on('user_online', ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => [...prev, userId]);
      });

      socketInstance.on('user_offline', ({ userId }: { userId: string }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      socketInstance.on('new_message', (message: Message) => {
        addMessage(message);
      });

      socketInstance.on('user_typing', ({ userId }: { userId: string }) => {
        setUserTyping(userId, true);
      });

      socketInstance.on('user_stopped_typing', ({ userId }: { userId: string }) => {
        setUserTyping(userId, false);
      });

      socketInstance.on('AppNotification', (AppNotification: AppNotification) => {
        addAppNotification(AppNotification);
      });

      socketInstance.on('unread_count', ({ count }: { count: number }) => {
        setUnreadCount(count);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, accessToken]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socket) {
      socket.emit('send_message', { receiverId, content });
    }
  };

  const startTyping = (receiverId: string) => {
    if (socket) {
      socket.emit('typing_start', { receiverId });
    }
  };

  const stopTyping = (receiverId: string) => {
    if (socket) {
      socket.emit('typing_stop', { receiverId });
    }
  };

  const markMessageAsRead = (messageId: string) => {
    if (socket) {
      socket.emit('mark_as_read', { messageId });
    }
  };

  const markConversationAsRead = (withUserId: string) => {
    if (socket) {
      socket.emit('mark_conversation_read', { withUserId });
    }
  };

  const markAppNotificationAsRead = (AppNotificationId: string) => {
    if (socket) {
      socket.emit('mark_AppNotification_read', { AppNotificationId });
    }
  };

  const markAllAppNotificationsAsRead = () => {
    if (socket) {
      socket.emit('mark_all_read');
    }
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    markConversationAsRead,
    markAppNotificationAsRead,
    markAllAppNotificationsAsRead,
  };
};