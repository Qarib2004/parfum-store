import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware';

export const getUserOrders = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                imageUrl: true,
                owner: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              owner: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isOwner = order.items.some((item) => item.product.ownerId === userId);
  const isCustomer = order.userId === userId;
  const isAdmin = user?.role === 'ADMIN';

  if (!isOwner && !isCustomer && !isAdmin) {
    throw new AppError('Access denied to this order', 403);
  }

  return order;
};

export const getAllOrders = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const { page = 1, limit = 20, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOwnerOrders = async (
  ownerId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              ownerId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        items: {
          where: {
            product: {
              ownerId,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              ownerId,
            },
          },
        },
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  userId: string
) => {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isOwner = order.items.some((item) => item.product.ownerId === userId);
  const isAdmin = user?.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('No permission to update order status', 403);
  }

 

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status},
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  return updatedOrder;
};

export const cancelOrder = async (orderId: string, userId: string) => {
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

  if (order.userId !== userId) {
    throw new AppError('No permission to cancel this order', 403);
  }

  if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
    throw new AppError('This order cannot be cancelled', 400);
  }

  if (order.status === 'PROCESSING') {
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
  }

  const cancelledOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });

  return cancelledOrder;
};

export const getOrderStats = async (userId?: string) => {
  const where: any = userId ? { userId } : {};

  const [total, pending, processing, completed, cancelled] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, status: 'PENDING' } }),
    prisma.order.count({ where: { ...where, status: 'PROCESSING' } }),
    prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
  ]);

  const revenue = await prisma.order.aggregate({
    where: { ...where, status: { in: ['PROCESSING', 'COMPLETED'] } },
    _sum: { totalAmount: true },
  });

  return {
    total,
    pending,
    processing,
    completed,
    cancelled,
    totalRevenue: revenue._sum.totalAmount || 0,
  };
};