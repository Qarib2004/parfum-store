import { prisma } from '../config/database';
import { AppError } from '../middleware';



export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  if (!content || content.trim().length === 0) {
    throw new AppError('message will not be waste', 400);
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new AppError('Получатель не найден', 404);
  }

  const message = await prisma.message.create({
    data: {
      senderId,
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

  return message;
};




export const getMessageHistory = async (
  userId: string,
  otherUserId: string,
  page: number = 1,
  limit: number = 50
) => {
  const skip = (page - 1) * limit;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
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
      receiver: {
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

  return {
    messages: messages.reverse(),
    pagination: {
      page,
      limit,
      hasMore: messages.length === limit,
    },
  };
};




export const getConversations = async (userId: string) => {
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

  return Array.from(conversationsMap.values());
};




export const getUnreadMessagesCount = async (userId: string) => {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      read: false,
    },
  });

  return count;
};



export const markMessageAsRead = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { receiverId: true },
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.receiverId !== userId) {
    throw new AppError('not rules for changed message', 403);
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { read: true },
  });

  return updatedMessage;
};



export const markConversationAsRead = async (userId: string, otherUserId: string) => {
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });

  return { message: 'all messages mark  gow readed' };
};



export const deleteMessage = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { senderId: true, receiverId: true },
  });

  if (!message) {
    throw new AppError('message not found', 404);
  }


  if (message.senderId !== userId && message.receiverId !== userId) {
    throw new AppError('not rules for deleting message', 403);
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  return { message: 'message success deleted' };
};




export const deleteConversation = async (userId: string, otherUserId: string) => {
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
  });

  return { message: 'messages success deleted' };
};