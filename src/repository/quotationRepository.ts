import { AppDataSource } from '../config/database';
import { QuotationRequest } from '../entity/QuotationRequest';

export const quotationRepository = AppDataSource.getRepository(QuotationRequest);
