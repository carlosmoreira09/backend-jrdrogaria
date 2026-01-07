import { AppDataSource } from '../config/database';
import { PurchaseOrder } from '../entity/PurchaseOrder';

export const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
