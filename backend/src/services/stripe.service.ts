import Stripe from 'stripe';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { createNotification } from './notification.service';
import { AppError } from '../middleware';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover'
});

interface CartItem {
  productId: string;
  quantity: number;
}


export const createCheckoutSession = async (userId: string, items: CartItem[]) => {
  if (!items || items.length === 0) {
    throw new AppError('basket is waste', 400);
  }

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (products.length !== items.length) {
    throw new AppError('Некоторые продукты не найдены', 404);
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }
    if (product.quantity < item.quantity) {
      throw new AppError(
        `nor enough "${product.name}". Avialable: ${product.quantity}`,
        400
      );
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      totalAmount,
      status: 'PENDING',
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        }),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map(
    (product) => {
      const item = items.find((i) => i.productId === product.id)!;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `${product.brand} - ${product.volume}мл`,
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    }
  );


  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
    cancel_url: `${env.STRIPE_CANCEL_URL}?order_id=${order.id}`,
    customer_email: (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })
    )?.email,
    metadata: {
      orderId: order.id,
      userId,
    },
  });


  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return {
    sessionId: session.id,
    sessionUrl: session.url,
    order,
  };
};



export const handlePaymentSuccess = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    throw new AppError('payment not completed', 400);
  }

  const orderId = session.metadata?.orderId;
  if (!orderId) {
    throw new AppError('Order ID not found', 400);
  }


  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PROCESSING',
      stripePaymentId: session.payment_intent as string,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              owner: true,
            },
          },
        },
      },
      user: true,
    },
  });


  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        quantity: {
          decrement: item.quantity,
        },
      },
    });
  }

  await createNotification({
    userId: order.userId,
    type: 'ORDER',
    title: 'The order has been paid',
    message: `Your order #${order.orderNumber} success paid.Total amount: $${order.totalAmount.toFixed(2)}`,
    link: `/orders/${order.id}`,
    metadata: { orderId: order.id },
  });


  const ownerIds = new Set(order.items.map((item) => item.product.ownerId));
  for (const ownerId of ownerIds) {
    const ownerItems = order.items.filter((item) => item.product.ownerId === ownerId);
    const ownerTotal = ownerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await createNotification({
      userId: ownerId,
      type: 'ORDER',
      title: 'New order',
      message: `get new order on sum $${ownerTotal.toFixed(2)}. Order #${order.orderNumber}`,
      link: `/dashboard/orders/${order.id}`,
      metadata: { orderId: order.id },
    });
  }

  return order;
};



export const checkPaymentStatus = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return {
    status: session.payment_status,
    paymentIntent: session.payment_intent,
  };
};



export const refundPayment = async (orderId: string, adminId: string) => {
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('only admin can returned order', 403);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!order.stripePaymentId) {
    throw new AppError('Payment  not found', 400);
  }

  if (order.status === 'CANCELLED') {
    throw new AppError('Order cancelled', 400);
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.stripePaymentId,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        quantity: {
          increment: item.quantity,
        },
      },
    });
  }

  await createNotification({
    userId: order.userId,
    type: 'ORDER',
    title: 'Order cancelled',
    message: `our order #${order.orderNumber} was cancell. Money return for 10-15 days.`,
    link: `/orders/${order.id}`,
    metadata: { orderId: order.id, refundId: refund.id },
  });

  return {
    order,
    refund,
  };
};



export const getPaymentInfo = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    created: new Date(paymentIntent.created * 1000),
  };
};