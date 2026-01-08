/**
 * Admin Auth Middleware - Autenticação separada para super admins
 * Usa JWT próprio para admin_users
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entity/AdminUser';

const getAdminUserRepository = () => AppDataSource.getRepository(AdminUser);

export interface AdminTokenPayload {
  adminId: number;
  email: string;
  role: 'super_admin' | 'support' | 'billing';
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
      adminPayload?: AdminTokenPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key';

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Admin authorization required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;

    const admin = await getAdminUserRepository().findOne({
      where: { id: decoded.adminId, status: 'active' },
    });

    if (!admin) {
      res.status(401).json({ error: 'Admin not found or inactive' });
      return;
    }

    req.admin = admin;
    req.adminPayload = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid admin token' });
  }
};

export const requireAdminRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({ error: 'Insufficient admin permissions' });
      return;
    }

    next();
  };
};

export const generateAdminToken = (admin: AdminUser): string => {
  const payload: AdminTokenPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
};
