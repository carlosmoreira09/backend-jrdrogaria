import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Store } from '../entity/Store';
import { UserStore } from '../entity/UserStore';

const storeRepository = AppDataSource.getRepository(Store);
const userStoreRepository = AppDataSource.getRepository(UserStore);

export const resolveStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.tenant) {
            res.status(400).json({ error: 'Tenant must be resolved before store' });
            return;
        }

        const storeId = req.headers['x-store-id'] as string || req.params.storeId;

        if (!storeId) {
            res.status(400).json({ error: 'X-Store-Id header or storeId param is required' });
            return;
        }

        const store = await storeRepository.findOne({
            where: {
                id: Number(storeId),
                tenant: { id: req.tenant.id },
                status: 'active'
            }
        });

        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }

        if (req.user) {
            const isTenantOwnerOrAdmin = ['tenant_owner', 'admin'].includes(req.user.role);
            
            if (!isTenantOwnerOrAdmin) {
                const hasAccess = await userStoreRepository.findOne({
                    where: { 
                        user_id: req.user.id,
                        store_id: store.id 
                    }
                });

                if (!hasAccess) {
                    res.status(403).json({ error: 'You do not have access to this store' });
                    return;
                }
            }
        }

        req.store = store;
        next();
    } catch (error) {
        console.error('Error resolving store:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const optionalStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.tenant) {
            return next();
        }

        const storeId = req.headers['x-store-id'] as string || req.params.storeId;

        if (storeId) {
            const store = await storeRepository.findOne({
                where: {
                    id: Number(storeId),
                    tenant: { id: req.tenant.id },
                    status: 'active'
                }
            });

            if (store) {
                req.store = store;
            }
        }

        next();
    } catch (error) {
        console.error('Error resolving optional store:', error);
        next();
    }
};
