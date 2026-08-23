import { Response } from 'express';
import { ApiResponse } from '@skillxchange/shared';

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode = 200) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, errors: string[] = [], statusCode = 400) {
  const body: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(body);
}
