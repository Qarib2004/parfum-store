import type { Request, Response } from 'express';
import * as messageService from '../services/message.service';



export const sendMessage = async (req: Request, res: Response) => {
  const senderId = req.user!.userId;
  const { receiverId, content } = req.body;

  const message = await messageService.sendMessage(senderId, receiverId, content);

  res.status(201).json({
    success: true,
    message: 'Message sended',
    data: message,
  });
};



export const getMessageHistory = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { otherUserId } = req.params;
  const { page, limit } = req.query;

  if (!otherUserId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await messageService.getMessageHistory(
    userId,
    otherUserId,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );

  res.json({
    success: true,
    data: result,
  });
};



export const getConversations = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const conversations = await messageService.getConversations(userId);

  res.json({
    success: true,
    data: conversations,
  });
};



export const getUnreadMessagesCount = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const count = await messageService.getUnreadMessagesCount(userId);

  res.json({
    success: true,
    data: { count },
  });
};




export const markMessageAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { messageId } = req.params;

  if (!messageId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const message = await messageService.markMessageAsRead(messageId, userId);

  res.json({
    success: true,
    message: 'Message marked',
    data: message,
  });
};



export const markConversationAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { otherUserId } = req.params;

  if (!otherUserId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await messageService.markConversationAsRead(userId, otherUserId);

  res.json({
    success: true,
    message: result.message,
  });
};




export const deleteMessage = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { messageId } = req.params;

  if (!messageId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await messageService.deleteMessage(messageId, userId);

  res.json({
    success: true,
    message: result.message,
  });
};




export const deleteConversation = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { otherUserId } = req.params;


  if (!otherUserId) {
    return res.status(400).json({
      success: false,
      message: 'id is required',
    });
  }

  const result = await messageService.deleteConversation(userId, otherUserId);

  res.json({
    success: true,
    message: result.message,
  });
};