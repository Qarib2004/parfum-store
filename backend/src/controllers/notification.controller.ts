import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';



export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page, limit } = req.query;

  const result = await notificationService.getUserNotifications(
    userId,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};



export const getUnreadNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const notifications = await notificationService.getUnreadNotifications(userId);

  res.json({
    success: true,
    data: notifications,
  });
};



export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const count = await notificationService.getUnreadCount(userId);

  res.json({
    success: true,
    data: { count },
  });
};



export const getNotificationById = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const notification = await notificationService.getNotificationById(id, userId);

  res.json({
    success: true,
    data: notification,
  });
};



export const markNotificationAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const notification = await notificationService.markNotificationAsRead(id, userId);

  res.json({
    success: true,
    message: 'Notification marked how readed',
    data: notification,
  });
};



export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await notificationService.markAllAsRead(userId);

  res.json({
    success: true,
    message: result.message,
  });
};



export const deleteNotification = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const result = await notificationService.deleteNotification(id, userId);

  res.json({
    success: true,
    message: result.message,
  });
};



export const deleteAllRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await notificationService.deleteAllRead(userId);

  res.json({
    success: true,
    message: result.message,
    data: { count: result.count },
  });
};



export const deleteAllNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const result = await notificationService.deleteAllNotifications(userId);

  res.json({
    success: true,
    message: result.message,
    data: { count: result.count },
  });
};



export const getNotificationsByType = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { type } = req.params;
  const { page, limit } = req.query;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'type is required',
    });
  }


  const result = await notificationService.getNotificationsByType(
    userId,
    type,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};