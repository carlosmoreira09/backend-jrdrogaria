/**
 * Legacy Supplier Quotation Service - v1/v2 compatible
 * Mantém accessToken para links de fornecedor existentes
 * DEPRECATED: Usar supplierQuotationService.ts para novas implementações
 */

import { AppDataSource } from '../../config/database';
import { SupplierQuotation } from '../../entity/SupplierQuotation';
import { SupplierPrice } from '../../entity/SupplierPrice';
import { Supplier } from '../../entity/Supplier';
import { Products } from '../../entity/Products';
import { Tenant } from '../../entity/Tenant';
import { quotationRepository } from '../../repository/quotationRepository';
import { supplierQuotationRepository } from '../../repository/supplierQuotationRepository';
import { supplierRepository } from '../../repository/supplierRepository';
import { nanoid } from 'nanoid';

const DEFAULT_TENANT_ID = 1;

const generateSupplierToken = () => nanoid(32);

async function getDefaultTenant(): Promise<Tenant | null> {
  const tenantRepo = AppDataSource.getRepository(Tenant);
  return tenantRepo.findOne({ where: { id: DEFAULT_TENANT_ID } });
}

export const createSupplierQuotationsServiceLegacy = async (
  quotationId: number,
  supplierIds: number[]
) => {
  const tenant = await getDefaultTenant();
  const quotation = await quotationRepository.findOne({ where: { id: quotationId } });
  if (!quotation) throw new Error('Cotação não encontrada');

  const entities: SupplierQuotation[] = supplierIds.map((supplierId) => {
    const sq = new SupplierQuotation();
    const supplier = new Supplier();
    supplier.id = supplierId;
    sq.supplier = supplier;
    sq.quotationRequest = quotation;
    sq.token_hash = generateSupplierToken();
    sq.status = 'pending';
    sq.tenant = tenant || undefined;
    return sq;
  });

  const saved = await supplierQuotationRepository.save(entities);
  return saved;
};

export const getSupplierQuotationByTokenServiceLegacy = async (token: string) => {
  return supplierQuotationRepository.findOne({
    where: { token_hash: token },
    relations: [
      'supplier',
      'quotationRequest',
      'quotationRequest.items',
      'quotationRequest.items.product',
    ],
  });
};

export type SupplierPricePayload = {
  productId: number;
  unitPrice: number | null;
  available: boolean;
  observation?: string;
};

export const saveSupplierPricesServiceLegacy = async (
  token: string,
  prices: SupplierPricePayload[],
  submit = false,
) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const sqRepo = manager.getRepository(SupplierQuotation);
    const spRepo = manager.getRepository(SupplierPrice);
    const productRepo = manager.getRepository(Products);

    const supplierQuotation = await sqRepo.findOne({
      where: { token_hash: token },
      relations: ['quotationRequest'],
    });
    if (!supplierQuotation) throw new Error('Link inválido');

    await spRepo.delete({ supplierQuotation: { id: supplierQuotation.id } });

    const priceEntities: SupplierPrice[] = prices.map((p) => {
      const sp = new SupplierPrice();
      sp.supplierQuotation = supplierQuotation;
      const product = productRepo.create({ id: p.productId });
      sp.product = product;
      sp.unitPrice = p.unitPrice ?? undefined;
      sp.available = p.available;
      sp.observation = p.observation;
      sp.tenant = tenant || undefined;
      return sp;
    });

    await spRepo.save(priceEntities);

    if (submit) {
      supplierQuotation.status = 'submitted';
      supplierQuotation.submitted_at = new Date();
      await sqRepo.save(supplierQuotation);
    }

    return supplierQuotation;
  });
};

export const listSupplierQuotationsServiceLegacy = async (quotationId: number) => {
  return supplierQuotationRepository.find({
    where: { quotationRequest: { id: quotationId } },
    relations: ['supplier', 'prices', 'prices.product'],
  });
};

export type PublicQuotationSupplierData = {
  supplierName: string;
  whatsAppNumber?: string;
  paymentTerm?: string;
};

export const submitPublicQuotationServiceLegacy = async (
  token: string,
  supplierData: PublicQuotationSupplierData,
  prices: SupplierPricePayload[],
) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const sqRepo = manager.getRepository(SupplierQuotation);
    const spRepo = manager.getRepository(SupplierPrice);
    const supplierRepo = manager.getRepository(Supplier);
    const productRepo = manager.getRepository(Products);

    const existingQuotation = await sqRepo.findOne({
      where: { token_hash: token },
      relations: ['quotationRequest'],
    });

    if (!existingQuotation) throw new Error('Token inválido');

    const quotation = existingQuotation.quotationRequest;

    const newSupplier = supplierRepo.create({
      supplier_name: supplierData.supplierName,
      whatsAppNumber: supplierData.whatsAppNumber || '',
      payment_term: supplierData.paymentTerm || 'A combinar',
      tenant: tenant || undefined,
    });
    const savedSupplier = await supplierRepo.save(newSupplier);

    const supplierQuotation = sqRepo.create({
      supplier: savedSupplier,
      quotationRequest: quotation,
      token_hash: generateSupplierToken(),
      status: 'submitted',
      submitted_at: new Date(),
      tenant: tenant || undefined,
    });
    const savedSQ = await sqRepo.save(supplierQuotation);

    const priceEntities: SupplierPrice[] = prices.map((p) => {
      const sp = new SupplierPrice();
      sp.supplierQuotation = savedSQ;
      const product = productRepo.create({ id: p.productId });
      sp.product = product;
      sp.unitPrice = p.unitPrice ?? undefined;
      sp.available = p.available;
      sp.observation = p.observation;
      sp.tenant = tenant || undefined;
      return sp;
    });

    await spRepo.save(priceEntities);

    return { supplier: savedSupplier, supplierQuotation: savedSQ };
  });
};
