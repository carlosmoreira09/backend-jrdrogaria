/**
 * Legacy Quotation Service - v1/v2 compatible
 * Não requer tenant/store - usa tenant default (ID: 1)
 * DEPRECATED: Usar quotationService.ts para novas implementações
 */

import { AppDataSource } from '../../config/database';
import { QuotationRequest } from '../../entity/QuotationRequest';
import { QuotationItem } from '../../entity/QuotationItem';
import { Products } from '../../entity/Products';
import { Tenant } from '../../entity/Tenant';
import { quotationRepository } from '../../repository/quotationRepository';

const DEFAULT_TENANT_ID = 1;

async function getDefaultTenant(): Promise<Tenant | null> {
  const tenantRepo = AppDataSource.getRepository(Tenant);
  return tenantRepo.findOne({ where: { id: DEFAULT_TENANT_ID } });
}

export type QuotationPayload = {
  name: string;
  deadline?: string;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
};

export const listQuotationsServiceLegacy = async () => {
  return quotationRepository.find({
    relations: ['items', 'items.product', 'supplierQuotations'],
    order: { created_at: 'DESC' },
  });
};

export const getQuotationDetailServiceLegacy = async (id: number) => {
  const quotation = await quotationRepository.findOne({
    where: { id },
    relations: [
      'items',
      'items.product',
      'supplierQuotations',
      'supplierQuotations.supplier',
      'supplierQuotations.prices',
    ],
  });
  if (!quotation) throw new Error('Cotação não encontrada');
  return quotation;
};

export const createQuotationServiceLegacy = async (payload: QuotationPayload) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const qrRepo = manager.getRepository(QuotationRequest);
    const qiRepo = manager.getRepository(QuotationItem);
    const productRepo = manager.getRepository(Products);

    const quotation = qrRepo.create({
      name: payload.name,
      deadline: payload.deadline ? new Date(payload.deadline) : undefined,
      status: 'draft',
      tenant: tenant || undefined,
    });

    const savedQuotation = await qrRepo.save(quotation);

    const items: QuotationItem[] = [];
    for (const item of payload.items) {
      const product = await productRepo.findOne({ where: { id: item.productId } });
      if (!product) continue;

      const qi = qiRepo.create({
        quotationRequest: savedQuotation,
        product,
        quantity: item.quantity,
        notes: item.notes,
        tenant: tenant || undefined,
      });
      items.push(qi);
    }

    if (items.length > 0) {
      await qiRepo.save(items);
    }

    return { quotation: savedQuotation, items };
  });
};

export const updateQuotationServiceLegacy = async (
  id: number,
  payload: Partial<QuotationPayload>
) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const qrRepo = manager.getRepository(QuotationRequest);
    const qiRepo = manager.getRepository(QuotationItem);
    const productRepo = manager.getRepository(Products);

    const quotation = await qrRepo.findOne({ where: { id } });
    if (!quotation) throw new Error('Cotação não encontrada');

    if (payload.name) quotation.name = payload.name;
    if (payload.deadline) quotation.deadline = new Date(payload.deadline);

    await qrRepo.save(quotation);

    if (payload.items) {
      await qiRepo.delete({ quotationRequest: { id: quotation.id } });

      const items: QuotationItem[] = [];
      for (const item of payload.items) {
        const product = await productRepo.findOne({ where: { id: item.productId } });
        if (!product) continue;

        const qi = qiRepo.create({
          quotationRequest: quotation,
          product,
          quantity: item.quantity,
          notes: item.notes,
          tenant: tenant || undefined,
        });
        items.push(qi);
      }

      if (items.length > 0) {
        await qiRepo.save(items);
      }
    }

    return quotation;
  });
};

export const deleteQuotationServiceLegacy = async (id: number) => {
  const quotation = await quotationRepository.findOne({ where: { id } });
  if (!quotation) throw new Error('Cotação não encontrada');
  await quotationRepository.remove(quotation);
  return { success: true };
};
