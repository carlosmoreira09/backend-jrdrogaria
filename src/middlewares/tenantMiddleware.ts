import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/httpResponses';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        res.status(400).send(new Error('Tenant ID is required'));
    } else {
        req.tenantId = parseInt(tenantId as string);
        next();
    }
}
