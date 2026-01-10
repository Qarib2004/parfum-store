import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorHandler {
  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    switch (error.code) {
      case 'P2002':
        const field = (error.meta?.target as string[])?.join(', ') || 'field';
        return {
          statusCode: 409,
          message: `${field} is already in use`,
        };

      case 'P2025':
        return {
          statusCode: 404,
          message: 'Record not found',
        };

      case 'P2003':
        return {
          statusCode: 400,
          message: 'Related record not found',
        };

      case 'P2014':
        return {
          statusCode: 400,
          message: 'Required relationship violation',
        };

      default:
        return {
          statusCode: 500,
          message: 'Database error',
        };
    }
  }

  private static handleZodError(error: ZodError): {
    statusCode: number;
    message: string;
    errors: any[];
  } {
    const errors = error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      statusCode: 400,
      message: 'Validation Error',
      errors,
    };
  }

  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors: any[] | undefined;

    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
      });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const handled = ErrorHandler.handlePrismaError(err);
      statusCode = handled.statusCode;
      message = handled.message;
    } else if (err instanceof ZodError) {
      const handled = ErrorHandler.handleZodError(err);
      statusCode = handled.statusCode;
      message = handled.message;
      errors = handled.errors;
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (err.name === 'MulterError') {
      statusCode = 400;
      message = `File upload error: ${err.message}`;
    }

    const response: any = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
      response.error = err;
    }

    res.status(statusCode).json(response);
  }

  static notFound(req: Request, res: Response, next: NextFunction) {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
  }
}

export const errorHandler = ErrorHandler.handle;
export const notFound = ErrorHandler.notFound;