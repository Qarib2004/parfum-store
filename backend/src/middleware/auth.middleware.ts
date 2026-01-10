import type { NextFunction,Request,Response } from "express";
import JWTUtil from "../utils/jwt.util";
import { prisma } from '../config/database';


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            success:false,
            message:'not represented token'
        })
      }

      const token = authHeader.substring(7);

      const payload = JWTUtil.verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден',
        });
      }


      req.user = {
        userId:user.id,
        email:user.email,
        role:user.role
      };

      next()

    } catch (error:any) {
        return res.status(401).json({
            success: false,
            message: error.message || 'incorrect token',
          });
    }
  }


  static async optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = JWTUtil.verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        });

        if (user) {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };
        }
      }

      next();
    } catch (error) {
      next();
    }
  }
}



export const authenticate = AuthMiddleware.authenticate;
export const optionalAuth = AuthMiddleware.optionalAuth;