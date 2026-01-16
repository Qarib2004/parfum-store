import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { asyncHandler, authenticate } from '../middleware';


const router = Router();


router.post(
  '/',
  authenticate,
  asyncHandler(messageController.sendMessage)
);


router.get(
  '/conversations',
  authenticate,
  asyncHandler(messageController.getConversations)
);



router.get(
  '/unread-count',
  authenticate,
  asyncHandler(messageController.getUnreadMessagesCount)
);



router.get(
  '/:otherUserId',
  authenticate,
  asyncHandler(messageController.getMessageHistory)
);



router.put(
  '/:messageId/read',
  authenticate,
  asyncHandler(messageController.markMessageAsRead)
);



router.put(
  '/:otherUserId/read-all',
  authenticate,
  asyncHandler(messageController.markConversationAsRead)
);



router.delete(
  '/:messageId',
  authenticate,
  asyncHandler(messageController.deleteMessage)
);



router.delete(
  '/conversation/:otherUserId',
  authenticate,
  asyncHandler(messageController.deleteConversation)
);

export default router;