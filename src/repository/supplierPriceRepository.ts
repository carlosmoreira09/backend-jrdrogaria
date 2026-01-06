import { AppDataSource } from '../config/database';
import { SupplierPrice } from '../entity/SupplierPrice';

export const supplierPriceRepository = AppDataSource.getRepository(SupplierPrice);
