import { Request, Response, NextFunction } from 'express';

export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role == 'supplier') {
        return res.send('Acesso negado: Apenas administradores podem realizar esta ação').status(403);
    }
    next();
};
