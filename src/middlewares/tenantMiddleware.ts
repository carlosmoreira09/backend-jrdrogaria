import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        res.sendStatus(400)
    } else {
        req.tenantId = parseInt(tenantId as string);
        next();
    }
}
