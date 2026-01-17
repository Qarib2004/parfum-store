import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import productRoutes from './product.route';
import ownerRequestRoutes from './ownerRequest.route';
import shopRoutes from './shop.route';
import messageRoutes from './message.route';
import notificationRoutes from './notification.route';
import orderRoutes from './order.route';
import stripeRoutes from './stripe.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/owner-requests', ownerRequestRoutes);
router.use('/shops', shopRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/orders', orderRoutes);
router.use('/stripe', stripeRoutes);

export default router;