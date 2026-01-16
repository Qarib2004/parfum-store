import { prisma } from '../config/database';
import { AppError } from '../middleware';
import { uploadImage, deleteImage } from '../utils/cloudinary.util';
import { generateUniqueShopSlug } from '../utils/slug.utils';

interface CreateShopData {
  name: string;
  description?: string;
  address?: string;
}

interface UpdateShopData {
  name?: string;
  description?: string;
  address?: string;
}



export const createShop = async (ownerId: string, data: CreateShopData) => {
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { role: true },
  });

  if (!user || user.role !== 'OWNER') {
    throw new AppError('only owmer can create sshop', 403);
  }

  const existingShop = await prisma.shop.findUnique({
    where: { ownerId },
  });

  if (existingShop) {
    throw new AppError('you have shop', 400);
  }


  const slug = await generateUniqueShopSlug(data.name)

  const shop = await prisma.shop.create({
    data: {
      ownerId,
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
        },
      },
    },
  });

  return shop;
};


export const getAllShops = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { page = 1, limit = 20, search } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shop.count({ where }),
  ]);

  return {
    shops,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const getShopById = async (shopId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }


  const products = await prisma.product.findMany({
    where: { ownerId: shop.ownerId },
    take: 12,
    orderBy: { createdAt: 'desc' },
  });


  const stats = await prisma.product.aggregate({
    where: { ownerId: shop.ownerId },
    _count: { id: true },
    _sum: { quantity: true },
  });

  return {
    ...shop,
    products,
    stats: {
      totalProducts: stats._count.id || 0,
      totalQuantity: stats._sum.quantity || 0,
    },
  };
};





export const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }


  const products = await prisma.product.findMany({
    where: { ownerId: shop.ownerId },
    take: 12,
    orderBy: { createdAt: 'desc' },
  });


  const stats = await prisma.product.aggregate({
    where: { ownerId: shop.ownerId },
    _count: { id: true },
    _sum: { quantity: true },
  });

  return {
    ...shop,
    products,
    stats: {
      totalProducts: stats._count.id || 0,
      totalQuantity: stats._sum.quantity || 0,
    },
  };
};



export const getShopByOwnerId = async (ownerId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { ownerId },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
          email: true,
        },
      },
    },
  });

  if (!shop) {
    throw new AppError('store not found', 404);
  }

  return shop;
};




export const updateShop = async (
  shopId: string,
  ownerId: string,
  data: UpdateShopData
) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }

  if (shop.ownerId !== ownerId) {
    throw new AppError('not rules for changing shop', 403);
  }

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  return updatedShop;
};




export const updateShopLogo = async (
  shopId: string,
  ownerId: string,
  fileBuffer: Buffer,
  originalName: string
) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true, logoUrl: true },
  });

  if (!shop) {
    throw new AppError('Магазин не найден', 404);
  }

  if (shop.ownerId !== ownerId) {
    throw new AppError('not rules for changing shop', 403);
  }

  if (shop.logoUrl) {
    await deleteImage(shop.logoUrl);
  }

  const logoUrl = await uploadImage(
    fileBuffer,
    originalName,
    'perfume-shop/logos'
  );

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: { logoUrl },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  return updatedShop;
};


export const deleteShopLogo = async (shopId: string, ownerId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true, logoUrl: true },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }

  if (shop.ownerId !== ownerId) {
    throw new AppError('not rules for changing shop', 403);
  }

  if (shop.logoUrl) {
    await deleteImage(shop.logoUrl);
  }

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: { logoUrl: null },
  });

  return updatedShop;
};




export const deleteShop = async (shopId: string, ownerId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true, logoUrl: true },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }

  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { role: true },
  });

  if (shop.ownerId !== ownerId && user?.role !== 'ADMIN') {
    throw new AppError('not rules for deleting shop', 403);
  }

  if (shop.logoUrl) {
    await deleteImage(shop.logoUrl);
  }

  await prisma.shop.delete({
    where: { id: shopId },
  });

  return { message: 'shop deleted succes' };
};


export const getShopProducts = async (
  shopId: string,
  page: number = 1,
  limit: number = 20
) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: shop.ownerId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({
      where: { ownerId: shop.ownerId },
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const getShopStats = async (shopId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  });

  if (!shop) {
    throw new AppError('shop not found', 404);
  }

  const [productStats, orderStats] = await Promise.all([
    prisma.product.aggregate({
      where: { ownerId: shop.ownerId },
      _count: { id: true },
      _sum: { quantity: true },
      _avg: { price: true },
    }),
    prisma.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              ownerId: shop.ownerId,
            },
          },
        },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    products: {
      total: productStats._count.id || 0,
      totalQuantity: productStats._sum.quantity || 0,
      averagePrice: productStats._avg.price || 0,
    },
    orders: {
      total: orderStats._count.id || 0,
      totalRevenue: orderStats._sum.totalAmount || 0,
    },
  };
};



export const getShopProductsBySlug = async (
  slug: string,
  page: number = 1,
  limit: number = 20
) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { ownerId: true },
  });

  if (!shop) {
    throw new AppError('Магазин не найден', 404);
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { ownerId: shop.ownerId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({
      where: { ownerId: shop.ownerId },
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};