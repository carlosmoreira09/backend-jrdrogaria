/**
 * Legacy Purchase Order Service - v1/v2 compatible
 * Não requer tenant/store - usa tenant default (ID: 1)
 * DEPRECATED: Usar purchaseOrderService.ts para novas implementações
 */

import { AppDataSource } from '../../config/database';
import { PurchaseOrder } from '../../entity/PurchaseOrder';
import { PurchaseOrderItem } from '../../entity/PurchaseOrderItem';
import { Supplier } from '../../entity/Supplier';
import { Products } from '../../entity/Products';
import { QuotationRequest } from '../../entity/QuotationRequest';
import { Tenant } from '../../entity/Tenant';
import { purchaseOrderRepository } from '../../repository/purchaseOrderRepository';
import { getBestPricesServiceLegacy } from './priceComparisonService.legacy';

import { Store } from '../../entity/Store';

const DEFAULT_TENANT_ID = 1;
const DEFAULT_STORE_ID = 1;

async function getDefaultTenant(): Promise<Tenant> {
  const tenantRepo = AppDataSource.getRepository(Tenant);
  const tenant = await tenantRepo.findOne({ where: { id: DEFAULT_TENANT_ID } });
  if (!tenant) {
    throw new Error('Default tenant not found');
  }
  return tenant;
}

async function getDefaultStore(): Promise<Store> {
  const storeRepo = AppDataSource.getRepository(Store);
  const store = await storeRepo.findOne({ where: { id: DEFAULT_STORE_ID } });
  if (!store) {
    throw new Error('Default store not found');
  }
  return store;
}

export type CreateOrderPayloadLegacy = {
  quotationId: number;
  supplierId: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
};

export type UpdateOrderItemsPayloadLegacy = {
  items: {
    productId: number;
    quantity: number;
  }[];
};

const generateOrderNumber = (tenantId: number): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TEN${tenantId}-${year}-${random}`;
};

export const createPurchaseOrderServiceLegacy = async (
  payload: CreateOrderPayloadLegacy,
  userId?: number
) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const orderRepo = manager.getRepository(PurchaseOrder);
    const itemRepo = manager.getRepository(PurchaseOrderItem);

    const store = await getDefaultStore();
    
    const order = new PurchaseOrder();
    order.orderNumber = generateOrderNumber(tenant.id);
    order.tenant = tenant;
    order.store = store;

    const supplier = new Supplier();
    supplier.id = payload.supplierId;
    order.supplier = supplier;

    const quotation = new QuotationRequest();
    quotation.id = payload.quotationId;
    order.quotationRequest = quotation;
    order.status = 'draft';

    let totalValue = 0;
    const items: PurchaseOrderItem[] = payload.items.map((item) => {
      const orderItem = new PurchaseOrderItem();
      const product = new Products();
      product.id = item.productId;
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.unitPrice = item.unitPrice;
      orderItem.subtotal = item.quantity * item.unitPrice;
      orderItem.tenant = tenant;
      orderItem.store = store;
      totalValue += orderItem.subtotal;

      return orderItem;
    });

    order.totalValue = totalValue;
    const savedOrder = await orderRepo.save(order);

    for (const item of items) {
      item.purchaseOrder = savedOrder;
      await itemRepo.save(item);
    }

    return savedOrder;
  });
};

export const generateOrdersFromBestPricesServiceLegacy = async (
  quotationId: number,
  userId?: number
) => {
  const bestPrices = await getBestPricesServiceLegacy(quotationId);

  const ordersBySupplier = new Map<
    number,
    {
      supplierId: number;
      supplierName: string;
      items: {
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
      }[];
    }
  >();

  for (const bp of bestPrices) {
    if (!ordersBySupplier.has(bp.bestSupplierId)) {
      ordersBySupplier.set(bp.bestSupplierId, {
        supplierId: bp.bestSupplierId,
        supplierName: bp.bestSupplier,
        items: [],
      });
    }
    ordersBySupplier.get(bp.bestSupplierId)!.items.push({
      productId: bp.productId,
      productName: bp.productName,
      quantity: bp.quantity,
      unitPrice: bp.unitPrice,
    });
  }

  const orders: PurchaseOrder[] = [];

  for (const [, orderData] of ordersBySupplier) {
    const result = await createPurchaseOrderServiceLegacy(
      {
        quotationId,
        supplierId: orderData.supplierId,
        items: orderData.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
      userId
    );
    orders.push(result);
  }

  return orders;
};

export const listPurchaseOrdersServiceLegacy = async () => {
  return purchaseOrderRepository.find({
    relations: ['supplier', 'quotationRequest', 'items', 'items.product'],
    order: { created_at: 'DESC' },
  });
};

export const getPurchaseOrderDetailServiceLegacy = async (id: number) => {
  return purchaseOrderRepository.findOne({
    where: { id },
    relations: ['supplier', 'quotationRequest', 'items', 'items.product'],
  });
};

export const updatePurchaseOrderStatusServiceLegacy = async (
  id: number,
  status: 'draft' | 'sent' | 'confirmed' | 'delivered'
) => {
  const order = await purchaseOrderRepository.findOne({ where: { id } });
  if (!order) throw new Error('Pedido não encontrado');
  order.status = status;
  return purchaseOrderRepository.save(order);
};

export const updatePurchaseOrderItemsServiceLegacy = async (
  id: number,
  payload: UpdateOrderItemsPayloadLegacy
) => {
  const tenant = await getDefaultTenant();
  
  return AppDataSource.transaction(async (manager) => {
    const orderRepo = manager.getRepository(PurchaseOrder);
    const itemRepo = manager.getRepository(PurchaseOrderItem);

    const order = await orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) throw new Error('Pedido não encontrado');

    let totalValue = 0;

    for (const updateItem of payload.items) {
      const existingItem = order.items.find(
        (i) => i.product?.id === updateItem.productId || (i as any).productId === updateItem.productId
      );

      if (existingItem) {
        existingItem.quantity = updateItem.quantity;
        existingItem.subtotal = updateItem.quantity * Number(existingItem.unitPrice);
        totalValue += existingItem.subtotal;
        await itemRepo.save(existingItem);
      }
    }

    order.totalValue = totalValue;
    await orderRepo.save(order);

    return order;
  });
};
