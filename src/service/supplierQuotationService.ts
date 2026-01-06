import { supplierQuotationRepository } from '../repository/supplierQuotationRepository';
import { supplierPriceRepository } from '../repository/supplierPriceRepository';
import { quotationRepository } from '../repository/quotationRepository';
import { SupplierQuotation } from '../entity/SupplierQuotation';
import { SupplierPrice } from '../entity/SupplierPrice';
import { Supplier } from '../entity/Supplier';
import { Products } from '../entity/Products';
import { AppDataSource } from '../config/database';
import crypto from 'crypto';

export type SupplierPricePayload = {
  productId: number;
  unitPrice?: number;
  available?: boolean;
  observation?: string;
};

export const generateSupplierToken = () => crypto.randomUUID().replace(/-/g, '').slice(0, 32);

export const createSupplierQuotationsService = async (
  quotationId: number,
  supplierIds: number[],
) => {
  const quotation = await quotationRepository.findOne({ where: { id: quotationId } });
  if (!quotation) throw new Error('Cotação não encontrada');

  const entities: SupplierQuotation[] = supplierIds.map((supplierId) => {
    const sq = new SupplierQuotation();
    const supplier = new Supplier();
    supplier.id = supplierId;
    sq.supplier = supplier;
    sq.quotationRequest = quotation;
    sq.accessToken = generateSupplierToken();
    sq.status = 'pending';
    return sq;
  });

  const saved = await supplierQuotationRepository.save(entities);
  return saved;
};

export const getSupplierQuotationByTokenService = async (token: string) => {
  return supplierQuotationRepository.findOne({
    where: { accessToken: token },
    relations: [
      'supplier',
      'quotationRequest',
      'quotationRequest.items',
      'quotationRequest.items.product',
    ],
  });
};

export const saveSupplierPricesService = async (
  token: string,
  prices: SupplierPricePayload[],
  submit = false,
) => {
  return AppDataSource.transaction(async (manager) => {
    const sqRepo = manager.getRepository(SupplierQuotation);
    const spRepo = manager.getRepository(SupplierPrice);
    const productRepo = manager.getRepository(Products);

    const supplierQuotation = await sqRepo.findOne({
      where: { accessToken: token },
      relations: ['quotationRequest'],
    });
    if (!supplierQuotation) throw new Error('Link inválido');

    // Remove preços anteriores para regravar
    await spRepo.delete({ supplierQuotation: { id: supplierQuotation.id } });

    const priceEntities: SupplierPrice[] = prices.map((p) => {
      const sp = new SupplierPrice();
      sp.supplierQuotation = supplierQuotation;
      const product = productRepo.create({ id: p.productId });
      sp.product = product;
      sp.unitPrice = p.unitPrice;
      sp.available = p.available ?? true;
      sp.observation = p.observation;
      return sp;
    });

    await spRepo.save(priceEntities);

    supplierQuotation.status = submit ? 'submitted' : 'in_progress';
    supplierQuotation.submitted_at = submit ? new Date() : undefined;
    await sqRepo.save(supplierQuotation);

    return { message: submit ? 'Cotação enviada' : 'Rascunho salvo' };
  });
};

export const submitSupplierQuotationService = async (token: string) => {
  return saveSupplierPricesService(token, [], true);
};
