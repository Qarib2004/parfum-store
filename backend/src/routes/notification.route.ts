import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { asyncHandler, authenticate } from '../middleware';


const router = Router();


router.get(
  '/',
  authenticate,
  asyncHandler(notificationController.getUserNotifications)
);



router.get(
  '/unread',
  authenticate,
  asyncHandler(notificationController.getUnreadNotifications)
);



router.get(
  '/unread-count',
  authenticate,
  asyncHandler(notificationController.getUnreadCount)
);


router.get(
  '/type/:type',
  authenticate,
  asyncHandler(notificationController.getNotificationsByType)
);


router.get(
  '/:id',
  authenticate,
  asyncHandler(notificationController.getNotificationById)
);



router.put(
  '/:id/read',
  authenticate,
  asyncHandler(notificationController.markNotificationAsRead)
);



router.put(
  '/read-all',
  authenticate,
  asyncHandler(notificationController.markAllAsRead)
);


router.delete(
  '/:id',
  authenticate,
  asyncHandler(notificationController.deleteNotification)
);


router.delete(
  '/read/all',
  authenticate,
  asyncHandler(notificationController.deleteAllRead)
);



router.delete(
  '/all',
  authenticate,
  asyncHandler(notificationController.deleteAllNotifications)
);

export default router;