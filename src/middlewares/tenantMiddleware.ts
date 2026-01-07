import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'];
    console.log('x-tenant-id:', tenantId);
    if (!tenantId) {
        res.status(400).send({ message: 'Header x-tenant-id é obrigatório' });
        return;
    }
    req.tenantId = parseInt(tenantId as string);
    next();
}
