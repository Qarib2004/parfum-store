import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { asyncHandler, authenticate, authLimiter, validateBody } from '../middleware';

const router = Router();

router.post(
  '/register',
  // authLimiter,
  validateBody(registerSchema),
  asyncHandler(authController.register)
);


router.post(
  '/login',
  // authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);



router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);



router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);



router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getCurrentUser)
);

// router.post(
//   '/change-password',
//   asyncHandler(async (req, res) => {
//     const { userId, newPassword } = req.body;

//     if (!userId || !newPassword) {
//       return res.status(400).json({ message: 'userId and newPassword are required' });
//     }

//     const result = await authController.changePasswordDirectly(userId, newPassword);
//     res.json(result);
//   })
// );

export default router;