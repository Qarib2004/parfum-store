import type { Request, Response, NextFunction } from 'express';


export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    let data = '';
    
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
};

export default rawBodyMiddleware;