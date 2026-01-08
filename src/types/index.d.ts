import { Tenant } from '../entity/Tenant';
import { Store } from '../entity/Store';
import { Users } from '../entity/Users';

declare global {
    namespace Express {
        interface Request {
            tenantId?: number;
            tenant?: Tenant;
            store?: Store;
            user?: Users;
        }
    }
}

export {};
