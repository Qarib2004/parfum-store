import { prisma } from '../config/database';
import { AppError } from '../middleware';

interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}



export const createNotification = async (data: CreateNotificationData) => {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
    },
  });

  return notification;
};



export const createBulkNotifications = async (
  userIds: string[],
  data: Omit<CreateNotificationData, 'userId'>
) => {
  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata,
    })),
  });

  return notifications;
};



export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [notifications, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: { userId, read: false },
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: notifications.length === limit,
    },
  };
};




export const getUnreadNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
};




export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return count;
};



export const getNotificationById = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('Notifications not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('not access for notifications', 403);
  }

  return notification;
};



export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) {
    throw new AppError('notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('not success notification for message', 403);
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return updatedNotification;
};



export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });

  return { message: 'all messages mark' };
};



export const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) {
    throw new AppError('Notifications not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('not access for notifications', 403);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { message: 'notifictaion success deleted' };
};



export const deleteAllRead = async (userId: string) => {
  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      read: true,
    },
  });

  return {
    message: 'all marked notifications deleted',
    count: result.count,
  };
};




export const deleteAllNotifications = async (userId: string) => {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return {
    message: 'all messages deleted',
    count: result.count,
  };
};



export const getNotificationsByType = async (
  userId: string,
  type: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: {
        userId,
        type,
      },
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};