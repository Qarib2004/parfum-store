import type { Request, Response } from "express";
import type { LoginInput, RefreshTokenInput, RegisterInput } from "../schemas/auth.schema";
import * as authService from '../services/auth.service';







export const register = async (req:Request,res:Response) => {
    const data:RegisterInput = req.body;

    const result = await authService.register(data)

    res.status(201).json({
        success:true,
        message:'Registered success',
        data:result
    })
}



export const login =  async (req:Request,res:Response) => {
       const data:LoginInput = req.body;

       const result = await authService.login(data);

       res.json({
        success:true,
        message:'Login is success',
        data:result
       })
}



export const logout = async (req:Request,res:Response) => {
    const {refreshToken} = req.body

    const result = await authService.logout(refreshToken);

    res.json({
      success: true,
      message: result.message,
    });


}


export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenInput = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    message: 'Токен обновлен',
    data: result,
  });
};



export const getCurrentUser = async (req:Request,res:Response) => {
    const userId = req.user!.userId;

    const user = await authService.getCurrentUser(userId);
  
    res.json({
      success: true,
      data: user,
    });
}