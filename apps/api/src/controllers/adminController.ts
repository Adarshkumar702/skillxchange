import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminService } from '../services/adminService';
import { sendSuccess, sendError } from '../utils/responseFormatter';
import { ReportStatus } from '@skillxchange/shared';

const adminService = new AdminService();

export class AdminController {
  public async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const analytics = await adminService.getAnalytics();
      return sendSuccess(res, 'Admin analytics fetched', analytics);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const page = parseInt(req.query.page as string || '1', 10);
      const data = await adminService.getUsers(search, page);
      return sendSuccess(res, 'Users fetched', data);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getDeletedUsers(req: Request, res: Response) {
    try {
      const list = await adminService.getDeletedUsersList();
      return sendSuccess(res, 'Deleted users fetched', list);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      await adminService.deleteUser(req.params.id);
      return sendSuccess(res, 'User deleted', null);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const report = await adminService.createReport(req.user!.userId, req.body);
      return sendSuccess(res, 'Report submitted to admin queue', report, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const status = req.query.status as ReportStatus | undefined;
      const reports = await adminService.getReports(status);
      return sendSuccess(res, 'Reports fetched', reports);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async updateReportStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, adminNotes } = req.body;
      const report = await adminService.updateReportStatus(req.params.id, status, adminNotes);
      return sendSuccess(res, 'Report status updated', report);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
