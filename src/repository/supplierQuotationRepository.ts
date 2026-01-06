import { AppDataSource } from '../config/database';
import { SupplierQuotation } from '../entity/SupplierQuotation';

export const supplierQuotationRepository = AppDataSource.getRepository(SupplierQuotation);
