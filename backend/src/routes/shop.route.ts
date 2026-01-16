import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';
import { asyncHandler, authenticate, handleMulterError, optionalAuth, requireOwner, uploadSingle } from '../middleware';


const router = Router();


router.post(
  '/',
  authenticate,
  requireOwner,
  asyncHandler(shopController.createShop)
);


router.get(
  '/',
  optionalAuth,
  asyncHandler(shopController.getAllShops)
);


router.get(
  '/my',
  authenticate,
  requireOwner,
  asyncHandler(shopController.getMyShop)
);



router.get(
  '/slug/:slug',
  optionalAuth,
  asyncHandler(shopController.getShopBySlug)
);



router.get(
  '/slug/:slug/products',
  optionalAuth,
  asyncHandler(shopController.getShopProductsBySlug)
);


router.get(
  '/owner/:ownerId',
  optionalAuth,
  asyncHandler(shopController.getShopByOwnerId)
);


router.get(
  '/:id',
  optionalAuth,
  asyncHandler(shopController.getShopById)
);



router.get(
  '/:id/products',
  optionalAuth,
  asyncHandler(shopController.getShopProducts)
);



router.get(
  '/:id/stats',
  optionalAuth,
  asyncHandler(shopController.getShopStats)
);


router.put(
  '/:id',
  authenticate,
  requireOwner,
  asyncHandler(shopController.updateShop)
);



router.put(
  '/:id/logo',
  authenticate,
  requireOwner,
  uploadSingle,
  handleMulterError,
  asyncHandler(shopController.updateShopLogo)
);


router.delete(
  '/:id/logo',
  authenticate,
  requireOwner,
  asyncHandler(shopController.deleteShopLogo)
);



router.delete(
  '/:id',
  authenticate,
  requireOwner,
  asyncHandler(shopController.deleteShop)
);

export default router;