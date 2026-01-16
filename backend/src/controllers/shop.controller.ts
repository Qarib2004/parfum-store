import type { Request, Response } from 'express';
import * as shopService from '../services/shop.service';



export const createShop = async (req: Request, res: Response) => {
  const ownerId = req.user!.userId;
  const data = req.body;

  const shop = await shopService.createShop(ownerId, data);

  res.status(201).json({
    success: true,
    message: 'Shop craeted',
    data: shop,
  });
};



export const getAllShops = async (req: Request, res: Response) => {
  const { page, limit, search } = req.query;

  const filters = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string,
  };

  const result = await shopService.getAllShops(filters);

  res.json({
    success: true,
    data: result,
  });
};



export const getShopById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const shop = await shopService.getShopById(id);

  res.json({
    success: true,
    data: shop,
  });
};




export const getShopBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'slug is required',
    });
  }


  const shop = await shopService.getShopBySlug(slug);

  res.json({
    success: true,
    data: shop,
  });
};




export const getShopByOwnerId = async (req: Request, res: Response) => {
  const { ownerId } = req.params;

  if (!ownerId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const shop = await shopService.getShopByOwnerId(ownerId);

  res.json({
    success: true,
    data: shop,
  });
};




export const getMyShop = async (req: Request, res: Response) => {
  const ownerId = req.user!.userId;

  const shop = await shopService.getShopByOwnerId(ownerId);

  res.json({
    success: true,
    data: shop,
  });
};



export const updateShop = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user!.userId;
  const data = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const shop = await shopService.updateShop(id, ownerId, data);

  res.json({
    success: true,
    message: 'Магазин обновлен',
    data: shop,
  });
};




export const updateShopLogo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user!.userId;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File not presented',
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const shop = await shopService.updateShopLogo(
    id,
    ownerId,
    req.file.buffer,
    req.file.originalname
  );

  res.json({
    success: true,
    message: 'Logo updated',
    data: shop,
  });
};



export const deleteShopLogo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user!.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const shop = await shopService.deleteShopLogo(id, ownerId);

  res.json({
    success: true,
    message: 'logo deleted',
    data: shop,
  });
};



export const deleteShop = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user!.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const result = await shopService.deleteShop(id, ownerId);

  res.json({
    success: true,
    message: result.message,
  });
};




export const getShopProducts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page, limit } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const result = await shopService.getShopProducts(
    id,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};



export const getShopProductsBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { page, limit } = req.query;


  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'slug is required',
    });
  }



  const result = await shopService.getShopProductsBySlug(
    slug,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};


export const getShopStats = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }


  const stats = await shopService.getShopStats(id);

  res.json({
    success: true,
    data: stats,
  });
};