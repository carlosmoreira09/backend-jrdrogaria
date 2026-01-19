import { Request, Response } from 'express';
import {
  createPurchaseOrderService,
  deletePurchaseOrderService,
  generateOrdersFromBestPricesService,
  getPurchaseOrderDetailService,
  listPurchaseOrdersService,
  updatePurchaseOrderItemsService,
  updatePurchaseOrderStatusService,
} from '../service/purchaseOrderService';
import { exportOrderToExcel } from '../utils/excelExporter';

export const listPurchaseOrdersController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await listPurchaseOrdersService(tenantId);
    res.status(200).send({ data, message: 'Lista de pedidos.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getPurchaseOrderDetailController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await getPurchaseOrderDetailService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Detalhe do pedido.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const createPurchaseOrderController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const payload = req.body;
    const result = await createPurchaseOrderService(payload, tenantId);
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const generateOrdersController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const quotationId = Number(req.params.quotationId);
    const { orderItems } = req.body || {};
    const data = await generateOrdersFromBestPricesService(quotationId, tenantId, orderItems);
    res.status(201).send({ data, message: 'Pedidos gerados a partir dos melhores preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updatePurchaseOrderItemsController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const payload = req.body;
    const data = await updatePurchaseOrderItemsService(Number(req.params.id), payload, tenantId);
    res.status(200).send({ data, message: 'Quantidades atualizadas.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updatePurchaseOrderStatusController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const { status } = req.body;
    const data = await updatePurchaseOrderStatusService(Number(req.params.id), status, tenantId);
    res.status(200).send({ data, message: 'Status atualizado.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const deletePurchaseOrderController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await deletePurchaseOrderService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Pedido removido.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const exportPurchaseOrderController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const order = await getPurchaseOrderDetailService(Number(req.params.id), tenantId);
    if (!order) {
      res.status(404).send({ message: 'Pedido não encontrado' });
      return;
    }

    const exportData = {
      orderNumber: order.orderNumber,
      supplierName: order.supplier?.supplier_name || 'Fornecedor',
      items: order.items.map((item) => ({
        productName: item.product?.product_name || `Produto ${item.product?.id}`,
        quantities: item.quantities,
        orderQuantity: item.orderQuantity,
        targetStore: item.targetStore,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      totalValue: Number(order.totalValue),
    };

    const buffer = await exportOrderToExcel(exportData);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pedido_${order.orderNumber}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};
