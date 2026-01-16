import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { asyncHandler, authenticate, requireAdmin, requireOwner } from '../middleware';


const router = Router();


router.get(
  '/',
  authenticate,
  requireAdmin,
  asyncHandler(orderController.getAllOrders)
);


router.get(
  '/my',
  authenticate,
  asyncHandler(orderController.getUserOrders)
);


router.get(
  '/owner',
  authenticate,
  requireOwner,
  asyncHandler(orderController.getOwnerOrders)
);


router.get(
  '/stats',
  authenticate,
  asyncHandler(orderController.getOrderStats)
);


router.get(
  '/:id',
  authenticate,
  asyncHandler(orderController.getOrderById)
);


router.put(
  '/:id/status',
  authenticate,
  requireOwner,
  asyncHandler(orderController.updateOrderStatus)
);


router.put(
  '/:id/cancel',
  authenticate,
  asyncHandler(orderController.cancelOrder)
);

export default router;