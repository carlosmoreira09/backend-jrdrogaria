import { Request, Response, NextFunction } from 'express';

export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const adminRoles = ['tenant_owner', 'admin'];
    if (!req.user || !adminRoles.includes(req.user.role)) {
        return res.status(403).send('Acesso negado: Apenas administradores podem realizar esta ação');
    }
    next();
};
