import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseFormatter';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, err.errors || [message], statusCode);
}
