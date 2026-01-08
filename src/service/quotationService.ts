import { quotationRepository } from '../repository/quotationRepository';
import { QuotationRequest } from '../entity/QuotationRequest';
import { QuotationItem } from '../entity/QuotationItem';
import { Products } from '../entity/Products';
import { Tenant } from '../entity/Tenant';
import { Store } from '../entity/Store';
import { AppDataSource } from '../config/database';

export type CreateQuotationPayload = {
  name: string;
  deadline?: Date;
  items?: { productId: number; quantity: number; notes?: string }[];
};

export const createQuotationService = async (
  payload: CreateQuotationPayload,
  tenant: Tenant,
  store: Store
) => {
  const quotation = new QuotationRequest();
  quotation.name = payload.name;
  quotation.deadline = payload.deadline;
  quotation.status = 'draft';
  quotation.tenant = tenant;
  quotation.store = store;

  if (payload.items?.length) {
    quotation.items = payload.items.map((i) => {
      const item = new QuotationItem();
      const product = new Products();
      product.id = i.productId;
      item.product = product;
      item.quantity = i.quantity;
      item.notes = i.notes;
      item.tenant = tenant;
      item.store = store;
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
  return quotationRepository.findOne({
    where: { id },
    relations: ['items', 'items.product', 'supplierQuotations', 'supplierQuotations.supplier'],
  });
};

export const updateQuotationService = async (
  id: number,
  payload: Partial<CreateQuotationPayload> & { status?: QuotationRequest['status'] },
  tenant: Tenant,
  store: Store
) => {
  return AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(QuotationRequest);
    const quotation = await repo.findOne({ 
      where: { id, tenant: { id: tenant.id }, store: { id: store.id } }, 
      relations: ['items'] 
    });
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
        item.quantity = i.quantity;
        item.notes = i.notes;
        item.tenant = tenant;
        item.store = store;
        return item;
      });
    }

    return repo.save(quotation);
  });
};

export const deleteQuotationService = async (id: number) => {
  return quotationRepository.delete({ id });
};
