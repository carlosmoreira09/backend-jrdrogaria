import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Tenant } from '../entity/Tenant';
import { Not } from 'typeorm';

const tenantRepository = AppDataSource.getRepository(Tenant);

export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (!tenantSlug) {
            return res.status(400).json({ 
                error: 'X-Tenant-Slug header is required' 
            });
        }

        const tenant = await tenantRepository.findOne({
            where: { 
                slug: tenantSlug,
                status: Not('cancelled')
            }
        });

        if (!tenant) {
            return res.status(404).json({ 
                error: 'Tenant not found' 
            });
        }

        if (tenant.status === 'suspended') {
            return res.status(403).json({ 
                error: 'Account suspended. Please contact support.' 
            });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        console.error('Error resolving tenant:', error);
        return res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

export const optionalTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (tenantSlug) {
            const tenant = await tenantRepository.findOne({
                where: { 
                    slug: tenantSlug,
                    status: Not('cancelled')
                }
            });

            if (tenant && tenant.status !== 'suspended') {
                req.tenant = tenant;
            }
        }

        next();
    } catch (error) {
        console.error('Error resolving optional tenant:', error);
        next();
    }
};
