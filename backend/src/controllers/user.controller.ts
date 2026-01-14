import type { Request, Response } from 'express';
import * as userService from '../services/user.service';



export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const profile = await userService.getUserPortfolio(userId);

  res.json({
    success: true,
    data: profile,
  });
};




export const getUserById = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const user = await userService.getUserById(userId);

  res.json({
    success: true,
    data: user,
  });
};




export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = req.body;

  const updatedUser = await userService.updateUserProfile(userId, data);

  res.json({
    success: true,
    message: 'Profile updated',
    data: updatedUser,
  });
};




export const updateAvatar = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File not presented',
    });
  }

  const updatedUser = await userService.updateUserAvatar(
    userId,
    req.file.buffer,
    req.file.originalname
  );

  res.json({
    success: true,
    message: 'Avatar updated',
    data: updatedUser,
  });
};



export const deleteAvatar = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const updatedUser = await userService.deleteUserAvatar(userId);

  res.json({
    success: true,
    message: 'Avatar deleted',
    data: updatedUser,
  });
};



export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changePassword(userId, {
    currentPassword,
    newPassword,
  });

  res.json({
    success: true,
    message: result.message,
  });
};



export const getAllUsers = async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;

  const result = await userService.getAllUsers(Number(page), Number(limit));

  res.json({
    success: true,
    data: result,
  });
};




export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const result = await userService.deleteUser(userId);

  res.json({
    success: true,
    message: result.message,
  });
};