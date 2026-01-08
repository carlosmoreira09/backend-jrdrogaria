import { AppDataSource } from '../config/database';
import { PurchaseOrder } from '../entity/PurchaseOrder';
import { PurchaseOrderItem } from '../entity/PurchaseOrderItem';
import { Supplier } from '../entity/Supplier';
import { Tenant } from '../entity/Tenant';
import { Products } from '../entity/Products';
import { QuotationRequest } from '../entity/QuotationRequest';
import { purchaseOrderRepository } from '../repository/purchaseOrderRepository';
import { getBestPricesService } from './priceComparisonService';

export type CreateOrderPayload = {
  quotationId: number;
  supplierId: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
};

export type UpdateOrderItemsPayload = {
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

export const createPurchaseOrderService = async (
  payload: CreateOrderPayload,
  tenantId: number
) => {
  return AppDataSource.transaction(async (manager) => {
    const orderRepo = manager.getRepository(PurchaseOrder);
    const itemRepo = manager.getRepository(PurchaseOrderItem);

    const tenant = new Tenant();
    tenant.id = tenantId;

    const supplier = new Supplier();
    supplier.id = payload.supplierId;

    const quotation = new QuotationRequest();
    quotation.id = payload.quotationId;

    const order = new PurchaseOrder();
    order.orderNumber = generateOrderNumber(tenantId);
    order.tenant = tenant;
    order.supplier = supplier;
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
      totalValue += orderItem.subtotal;

      return orderItem;
    });

    order.totalValue = totalValue;
    const savedOrder = await orderRepo.save(order);

    for (const item of items) {
      item.purchaseOrder = savedOrder;
    }
    await itemRepo.save(items);

    return { data: savedOrder, message: 'Pedido criado' };
  });
};

export const generateOrdersFromBestPricesService = async (
  quotationId: number,
  tenantId: number
) => {
  const bestPrices = await getBestPricesService(quotationId);

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
    const result = await createPurchaseOrderService(
      {
        quotationId,
        supplierId: orderData.supplierId,
        items: orderData.items,
      },
      tenantId
    );
    orders.push(result.data);
  }

  return orders;
};

export const listPurchaseOrdersService = async (tenantId: number) => {
  return purchaseOrderRepository.find({
    where: { tenant: { id: tenantId } },
    relations: ['supplier', 'quotationRequest', 'items', 'items.product'],
    order: { created_at: 'DESC' },
  });
};

export const getPurchaseOrderDetailService = async (
  id: number,
  tenantId: number
) => {
  return purchaseOrderRepository.findOne({
    where: { id, tenant: { id: tenantId } },
    relations: ['supplier', 'quotationRequest', 'items', 'items.product'],
  });
};

export const updatePurchaseOrderItemsService = async (
  id: number,
  payload: UpdateOrderItemsPayload,
  tenantId: number
) => {
  return AppDataSource.transaction(async (manager) => {
    const orderRepo = manager.getRepository(PurchaseOrder);
    const itemRepo = manager.getRepository(PurchaseOrderItem);

    const order = await orderRepo.findOne({
      where: { id, tenant: { id: tenantId } },
      relations: ['items'],
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

export const updatePurchaseOrderStatusService = async (
  id: number,
  status: PurchaseOrder['status'],
  tenantId: number
) => {
  const order = await purchaseOrderRepository.findOne({
    where: { id, tenant: { id: tenantId } },
  });

  if (!order) throw new Error('Pedido não encontrado');

  order.status = status;
  return purchaseOrderRepository.save(order);
};

export const deletePurchaseOrderService = async (
  id: number,
  tenantId: number
) => {
  return purchaseOrderRepository.delete({ id, tenant: { id: tenantId } });
};
