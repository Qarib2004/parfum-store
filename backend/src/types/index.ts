import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType = 
  | 'MESSAGE' 
  | 'ORDER' 
  | 'REQUEST_STATUS' 
  | 'PRODUCT_UPDATE' 
  | 'SYSTEM';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface CartItem {
  productId: string;
  quantity: number;
}


export interface StripeCheckoutSession {
  sessionId: string;
  sessionUrl: string | null;
}

export {};