import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { asyncHandler, authenticate, handleMulterError, requireAdmin, uploadSingle } from '../middleware';


const router = Router();


router.get(
  '/profile',
  authenticate,
  asyncHandler(userController.getProfile)
);


router.get(
  '/:userId',
  asyncHandler(userController.getUserById)
);



router.put(
  '/profile',
  authenticate,
  asyncHandler(userController.updateProfile)
);



router.put(
  '/avatar',
  authenticate,
  uploadSingle,
  handleMulterError,
  asyncHandler(userController.updateAvatar)
);



router.delete(
  '/avatar',
  authenticate,
  asyncHandler(userController.deleteAvatar)
);


router.put(
  '/password',
  authenticate,
  asyncHandler(userController.changePassword)
);



router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(userController.getAllUsers)
);



router.delete(
  '/:userId',
  authenticate,
  requireAdmin,
  asyncHandler(userController.deleteUser)
);

export default router;