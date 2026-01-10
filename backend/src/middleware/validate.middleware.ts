import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema} from 'zod';

type ValidationSource = 'body' | 'params' | 'query';

export class ValidationMiddleware {
  static validate(schema: ZodSchema, source: ValidationSource = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dataToValidate = req[source];

        const validatedData = await schema.parseAsync(dataToValidate);

        req[source] = validatedData;

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errors = error.issues.map((err:any) => ({
            field: err.path.join('.'),
            message: err.message,
          }));

          return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors,
          });
        }

        return res.status(400).json({
          success: false,
          message: 'Data Validation Failed',
        });
      }
    };
  }

  static validateBody(schema: ZodSchema) {
    return ValidationMiddleware.validate(schema, 'body');
  }

  static validateParams(schema: ZodSchema) {
    return ValidationMiddleware.validate(schema, 'params');
  }

  static validateQuery(schema: ZodSchema) {
    return ValidationMiddleware.validate(schema, 'query');
  }
}

export const validate = ValidationMiddleware.validate;
export const validateBody = ValidationMiddleware.validateBody;
export const validateParams = ValidationMiddleware.validateParams;
export const validateQuery = ValidationMiddleware.validateQuery;