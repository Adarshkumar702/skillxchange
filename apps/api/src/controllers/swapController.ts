import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SwapService } from '../services/swapService';
import { sendSuccess, sendError } from '../utils/responseFormatter';
import { SwapStatus } from '@skillxchange/shared';

const swapService = new SwapService();

export class SwapController {
  public async createSwap(req: AuthenticatedRequest, res: Response) {
    try {
      const swap = await swapService.createSwapRequest(req.user!.userId, req.body);
      return sendSuccess(res, 'Swap request sent successfully', swap, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getSwaps(req: AuthenticatedRequest, res: Response) {
    try {
      const status = req.query.status as SwapStatus | undefined;
      const swaps = await swapService.getSwapsForUser(req.user!.userId, status);
      return sendSuccess(res, 'Swaps fetched', swaps);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async acceptSwap(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await swapService.acceptSwapRequest(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Swap request accepted', result);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async rejectSwap(req: AuthenticatedRequest, res: Response) {
    try {
      const swap = await swapService.rejectSwapRequest(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Swap request rejected', swap);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async cancelSwap(req: AuthenticatedRequest, res: Response) {
    try {
      const swap = await swapService.cancelSwapRequest(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Swap request cancelled', swap);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async deleteSwap(req: AuthenticatedRequest, res: Response) {
    try {
      await swapService.deleteSwapRequest(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Swap request removed', null);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async completeSwap(req: AuthenticatedRequest, res: Response) {
    try {
      const swap = await swapService.completeSwapExchange(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Swap marked as completed', swap);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
