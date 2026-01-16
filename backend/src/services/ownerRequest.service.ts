import { AppError } from "../middleware";
import type { CreateOwnerRequestInput, ReviewOwnerRequestInput } from "../schemas/ownerRequest.schema";
import { createNotification } from "./notification.service";

export const createOwnerRequest = async (
  userId: string,
  data: CreateOwnerRequestInput
) => {
  const user = await prisma?.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'OWNER' || user.role === 'ADMIN') {
    throw new AppError('You are already an owner or an admin', 400);
  }

  const existingRequest = await prisma?.ownerRequest.findFirst({
    where: {
      userId,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    throw new AppError('You already have an active request', 400);
  }

  const { products } = data;

  const uniqueProducts = new Set(
    products.map((p) => `${p.name}-${p.brand}`)
  );
  const productsCount = uniqueProducts.size;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  if (productsCount < 15) {
    throw new AppError('At least 15 unique products are required', 400);
  }

  const allHaveMinimum = products.every((p) => p.quantity >= 7);
  if (!allHaveMinimum) {
    throw new AppError('Each product must have at least 7 items', 400);
  }

  const request = await prisma?.ownerRequest.create({
    data: {
      userId,
      productsCount,
      totalQuantity,
      productDetails: products,
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
    },
  });

  const admins = await prisma?.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });

  if (!admins || admins.length === 0) {
    return;
  }
  
  if (!request) {
    throw new AppError('Owner request not found', 404);
  }

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'REQUEST_STATUS',
        title: 'New Owner request',
        message: `User ${request.user.username} has submitted a request to become an owner`,
        link: `/admin/requests/${request.id}`,
        metadata: { requestId: request.id },
      })
    )
  );

  return request;
};

export const getOwnerRequestById = async (requestId: string) => {
  const request = await prisma?.ownerRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      },
    },
  });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  return request;
};

export const getAllOwnerRequests = async (filters: {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}) => {
  const { page = 1, limit = 20, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [requests, total] = await Promise.all([
    prisma?.ownerRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma?.ownerRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total ?? 0 / limit),
    },
  };
};

export const getUserOwnerRequests = async (userId: string) => {
  const requests = await prisma?.ownerRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
};

export const reviewOwnerRequest = async (
  adminId: string,
  data: ReviewOwnerRequestInput
) => {
  const { requestId, status, adminComment } = data;

  const admin = await prisma?.user.findUnique({
    where: { id: adminId },
    select: { role: true, username: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new AppError('Only admins can review requests', 403);
  }

  const request = await prisma?.ownerRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been reviewed', 400);
  }

  const updatedRequest = await prisma?.ownerRequest.update({
    where: { id: requestId },
    data: {
      status,
      adminComment,
      reviewedBy: adminId,
      reviewedAt: new Date(),
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
    },
  });

  if (status === 'APPROVED') {
    await prisma?.user.update({
      where: { id: request.userId },
      data: { role: 'OWNER' },
    });

    await prisma?.shop.create({
      data: {
        ownerId: request.userId,
        name: `Shop ${request.user.username}`,
        description: 'Welcome to my perfume shop!',
      },
    });
  }

  const notificationTitle =
    status === 'APPROVED'
      ? 'Request approved!'
      : 'Request rejected';

  const notificationMessage =
    status === 'APPROVED'
      ? 'Congratulations! Your request to become an owner has been approved. You can now create and sell products.'
      : `Unfortunately, your request was rejected. ${adminComment || 'No reason provided.'}`;

  await createNotification({
    userId: request.userId,
    type: 'REQUEST_STATUS',
    title: notificationTitle,
    message: notificationMessage,
    link: status === 'APPROVED' ? '/dashboard/products' : '/owner-request',
    metadata: { requestId, status },
  });

  return updatedRequest;
};

export const deleteOwnerRequest = async (requestId: string, userId: string) => {
  const request = await prisma?.ownerRequest.findUnique({
    where: { id: requestId },
    select: { userId: true, status: true },
  });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  const user = await prisma?.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (request.userId !== userId && user?.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this request', 403);
  }

  if (request.status === 'APPROVED') {
    throw new AppError('Approved requests cannot be deleted', 400);
  }

  await prisma?.ownerRequest.delete({
    where: { id: requestId },
  });

  return { message: 'Request successfully deleted' };
};

export const getOwnerRequestsStats = async () => {
  const [pending, approved, rejected, total] = await Promise.all([
    prisma?.ownerRequest.count({ where: { status: 'PENDING' } }),
    prisma?.ownerRequest.count({ where: { status: 'APPROVED' } }),
    prisma?.ownerRequest.count({ where: { status: 'REJECTED' } }),
    prisma?.ownerRequest.count(),
  ]);

  return {
    pending,
    approved,
    rejected,
    total,
  };
};
