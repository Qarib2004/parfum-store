import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { asyncHandler, authenticate, handleMulterError, optionalAuth, requireOwner, uploadSingle, validateBody } from '../middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.shcema';


const router = Router();


router.post(
  '/',
  authenticate,
  requireOwner,
  validateBody(createProductSchema),
  asyncHandler(productController.createProduct)
);


router.post(
  '/with-image',
  authenticate,
  requireOwner,
  uploadSingle,
  handleMulterError,
  validateBody(createProductSchema),
  asyncHandler(productController.createProductWithImage)
);



router.get(
  '/',
  optionalAuth,
  asyncHandler(productController.getAllProducts)
);



router.get(
  '/my/products',
  authenticate,
  requireOwner,
  asyncHandler(productController.getOwnerProducts)
);



router.get(
  '/my/stats',
  authenticate,
  requireOwner,
  asyncHandler(productController.getOwnerProductsStats)
);



router.get(
  '/slug/:slug',
  optionalAuth,
  asyncHandler(productController.getProductBySlug)
);



router.get(
  '/:id',
  optionalAuth,
  asyncHandler(productController.getProductById)
);



router.put(
  '/:id',
  authenticate,
  requireOwner,
  validateBody(updateProductSchema),
  asyncHandler(productController.updateProduct)
);



router.put(
  '/:id/image',
  authenticate,
  requireOwner,
  uploadSingle,
  handleMulterError,
  asyncHandler(productController.updateProductImage)
);



router.delete(
  '/:id',
  authenticate,
  requireOwner,
  asyncHandler(productController.deleteProduct)
);

export default router;