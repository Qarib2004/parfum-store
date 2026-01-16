import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';



export const getUserOrders = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page, limit } = req.query;

  const result = await orderService.getUserOrders(
    userId,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};



export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const order = await orderService.getOrderById(id, userId);

  res.json({
    success: true,
    data: order,
  });
};


export const getAllOrders = async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;

  const filters = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  };

  const result = await orderService.getAllOrders(filters);

  res.json({
    success: true,
    data: result,
  });
};



export const getOwnerOrders = async (req: Request, res: Response) => {
  const ownerId = req.user!.userId;
  const { page, limit } = req.query;

  const result = await orderService.getOwnerOrders(
    ownerId,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};



export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const order = await orderService.updateOrderStatus(id, status, userId);

  res.json({
    success: true,
    message: 'Status of order updated',
    data: order,
  });
};



export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const order = await orderService.cancelOrder(id, userId);

  res.json({
    success: true,
    message: 'Order cancelled',
    data: order,
  });
};



export const getOrderStats = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const stats = await orderService.getOrderStats(userId);

  res.json({
    success: true,
    data: stats,
  });
};