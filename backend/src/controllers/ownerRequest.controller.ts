import type { Request, Response } from 'express';
import * as ownerRequestService from '../services/ownerRequest.service';



export const createOwnerRequest = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = req.body;

  const request = await ownerRequestService.createOwnerRequest(userId, data);

  res.status(201).json({
    success: true,
    message: 'Request created and sended on wathing',
    data: request,
  });
};


export const getOwnerRequestById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const request = await ownerRequestService.getOwnerRequestById(id);

  res.json({
    success: true,
    data: request,
  });
};



export const getAllOwnerRequests = async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;

  const filters = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
  };

  const result = await ownerRequestService.getAllOwnerRequests(filters);

  res.json({
    success: true,
    data: result,
  });
};



export const getUserOwnerRequests = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const requests = await ownerRequestService.getUserOwnerRequests(userId);

  res.json({
    success: true,
    data: requests,
  });
};



export const reviewOwnerRequest = async (req: Request, res: Response) => {
  const adminId = req.user!.userId;
  const data = req.body;

  const request = await ownerRequestService.reviewOwnerRequest(adminId, data);

  res.json({
    success: true,
    message: 'requests watched',
    data: request,
  });
};



export const deleteOwnerRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await ownerRequestService.deleteOwnerRequest(id, userId);

  res.json({
    success: true,
    message: result.message,
  });
};



export const getOwnerRequestsStats = async (req: Request, res: Response) => {
  const stats = await ownerRequestService.getOwnerRequestsStats();

  res.json({
    success: true,
    data: stats,
  });
};