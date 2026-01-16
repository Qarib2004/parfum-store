import type { Request, Response } from 'express';
import * as stripeService from '../services/stripe.service';



export const createCheckoutSession = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { items } = req.body;

  const result = await stripeService.createCheckoutSession(userId, items);

  res.status(201).json({
    success: true,
    message: 'Checkout session created',
    data: result,
  });
};


export const handlePaymentSuccess = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  const order = await stripeService.handlePaymentSuccess(sessionId);

  res.json({
    success: true,
    message: 'payment wrapped succes',
    data: order,
  });
};



export const checkPaymentStatus = async (req: Request, res: Response) => {
  const { sessionId } = req.params;


  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const status = await stripeService.checkPaymentStatus(sessionId);

  res.json({
    success: true,
    data: status,
  });
};



export const refundPayment = async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const { orderId } = req.params;

  
  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await stripeService.refundPayment(orderId, adminId);

  res.json({
    success: true,
    message: 'Return success',
    data: result,
  });
};



export const getPaymentInfo = async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;


  
  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const paymentInfo = await stripeService.getPaymentInfo(paymentIntentId);

  res.json({
    success: true,
    data: paymentInfo,
  });
};



export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ Stripe webhook secret не настроен');
    return res.status(400).json({
      success: false,
      message: 'Webhook secret не настроен',
    });
  }

  let event;

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`,
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        await stripeService.handlePaymentSuccess(session.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(' Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error(' Payment failed:', paymentIntent.id);
        
       break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Charge refunded:', charge.id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`📋 Subscription ${event.type}:`, subscription.id);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ 
      received: true,
      eventType: event.type 
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
    });
  }
};
