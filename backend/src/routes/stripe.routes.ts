import { Router } from 'express';
import * as stripeController from '../controllers/stripe.controller';
import express from 'express';
import { asyncHandler, authenticate, requireAdmin } from '../middleware';

const router = Router();



router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(stripeController.createCheckoutSession)
);


router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(stripeController.stripeWebhook)
);


router.post(
  '/payment-success',
  authenticate,
  asyncHandler(stripeController.handlePaymentSuccess)
);


router.get(
  '/payment-status/:sessionId',
  authenticate,
  asyncHandler(stripeController.checkPaymentStatus)
);


router.post(
  '/refund/:orderId',
  authenticate,
  requireAdmin,
  asyncHandler(stripeController.refundPayment)
);


router.get(
  '/payment-info/:paymentIntentId',
  authenticate,
  requireAdmin,
  asyncHandler(stripeController.getPaymentInfo)
);

export default router;