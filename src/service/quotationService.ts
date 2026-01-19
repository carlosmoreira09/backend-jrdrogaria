import { quotationRepository } from '../repository/quotationRepository';
import { QuotationRequest } from '../entity/QuotationRequest';
import { QuotationItem } from '../entity/QuotationItem';
import { Products } from '../entity/Products';
import { AppDataSource } from '../config/database';
import crypto from 'crypto';

export const generatePublicToken = () => crypto.randomBytes(16).toString('hex');

export type CreateQuotationPayload = {
  name: string;
  deadline?: Date;
  items?: { productId: number; quantities: QuotationItem['quantities']; totalQuantity?: number }[];
};

export const createQuotationService = async (payload: CreateQuotationPayload) => {
  const quotation = new QuotationRequest();
  quotation.name = payload.name;
  quotation.deadline = payload.deadline;
  quotation.status = 'draft';
  quotation.public_token = generatePublicToken();

  if (payload.items?.length) {
    quotation.items = payload.items.map((i) => {
      const item = new QuotationItem();
      const product = new Products();
      product.id = i.productId;
      item.product = product;
      item.quantities = i.quantities;
      item.totalQuantity = i.totalQuantity;
      return item;
    });
  }

  const saved = await quotationRepository.save(quotation);
  return { data: saved, message: 'Cotação criada' };
};

export const listQuotationsService = async () => {
  return quotationRepository.find({
    relations: ['items', 'items.product', 'supplierQuotations'],
    order: { created_at: 'DESC' },
  });
};

export const getQuotationDetailService = async (id: number) => {
  const quotation = await quotationRepository.findOne({
    where: { id },
    relations: ['items', 'items.product', 'supplierQuotations', 'supplierQuotations.supplier'],
  });
  
  // Generate public_token for existing quotations that don't have one
  if (quotation && !quotation.public_token) {
    quotation.public_token = generatePublicToken();
    await quotationRepository.save(quotation);
  }
  
  return quotation;
};

export const updateQuotationService = async (
  id: number,
  payload: Partial<CreateQuotationPayload> & { status?: QuotationRequest['status'] },
) => {
  return AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(QuotationRequest);
    const quotation = await repo.findOne({ where: { id }, relations: ['items'] });
    if (!quotation) throw new Error('Cotação não encontrada');

    if (payload.name !== undefined) quotation.name = payload.name;
    if (payload.deadline !== undefined) quotation.deadline = payload.deadline;
    if (payload.status !== undefined) quotation.status = payload.status;

    if (payload.items) {
      await manager.getRepository(QuotationItem).delete({ quotationRequest: { id: quotation.id } });
      quotation.items = payload.items.map((i) => {
        const item = new QuotationItem();
        const product = new Products();
        product.id = i.productId;
        item.product = product;
        item.quantities = i.quantities;
        item.totalQuantity = i.totalQuantity;
        return item;
      });
    }

    return repo.save(quotation);
  });
};

export const deleteQuotationService = async (id: number) => {
  return quotationRepository.delete({ id });
};
