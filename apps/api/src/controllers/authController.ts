import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const authService = new AuthService();

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return sendSuccess(res, 'User registered successfully', result, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return sendSuccess(res, 'Login successful', result, 200);
    } catch (err: any) {
      return sendError(res, err.message, [], 401);
    }
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return sendError(res, 'Refresh token required', [], 401);
      }
      const result = await authService.refreshToken(token);
      return sendSuccess(res, 'Token refreshed', result, 200);
    } catch (err: any) {
      return sendError(res, err.message, [], 401);
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(token);
      res.clearCookie('refreshToken');
      return sendSuccess(res, 'Logged out successfully', null, 200);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
