import { Router } from 'express';
import * as ownerRequestController from '../controllers/ownerRequest.controller';
import {
  createOwnerRequestSchema,
  reviewOwnerRequestSchema,
} from '../schemas/ownerRequest.schema';
import { asyncHandler, authenticate, requireAdmin, validateBody } from '../middleware';

const router = Router();


router.post(
  '/',
  authenticate,
  validateBody(createOwnerRequestSchema),
  asyncHandler(ownerRequestController.createOwnerRequest)
);



router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(ownerRequestController.getAllOwnerRequests)
);


router.get(
  '/my',
  authenticate,
  asyncHandler(ownerRequestController.getUserOwnerRequests)
);



router.get(
  '/stats',
  authenticate,
  requireAdmin,
  asyncHandler(ownerRequestController.getOwnerRequestsStats)
);



router.get(
  '/:id',
  authenticate,
  asyncHandler(ownerRequestController.getOwnerRequestById)
);



router.put(
  '/:id/review',
  authenticate,
  requireAdmin,
  validateBody(reviewOwnerRequestSchema),
  asyncHandler(ownerRequestController.reviewOwnerRequest)
);



router.delete(
  '/:id',
  authenticate,
  asyncHandler(ownerRequestController.deleteOwnerRequest)
);

export default router;