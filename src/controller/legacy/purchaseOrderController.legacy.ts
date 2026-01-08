/**
 * Legacy Purchase Order Controller - v1/v2 compatible
 * DEPRECATED: Usar purchaseOrderController.ts para novas implementações
 */

import { Request, Response } from 'express';
import {
  createPurchaseOrderServiceLegacy,
  generateOrdersFromBestPricesServiceLegacy,
  listPurchaseOrdersServiceLegacy,
  getPurchaseOrderDetailServiceLegacy,
  updatePurchaseOrderStatusServiceLegacy,
  updatePurchaseOrderItemsServiceLegacy,
} from '../../service/legacy/purchaseOrderService.legacy';
import { exportOrderToExcelLegacy } from '../../utils/legacy/excelExporter.legacy';

export const createOrderControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const userId = (req as any).user?.id;
    const result = await createPurchaseOrderServiceLegacy(payload, userId);
    res.status(201).send({ data: result, message: 'Pedido criado.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const generateOrdersControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.quotationId);
    const userId = (req as any).user?.id;
    const orders = await generateOrdersFromBestPricesServiceLegacy(quotationId, userId);
    res.status(201).send({ data: orders, message: 'Pedidos gerados com sucesso.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const listOrdersControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await listPurchaseOrdersServiceLegacy();
    res.status(200).send({ data, message: 'Lista de pedidos.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getOrderDetailControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const data = await getPurchaseOrderDetailServiceLegacy(id);
    if (!data) {
      res.status(404).send({ message: 'Pedido não encontrado' });
      return;
    }
    res.status(200).send({ data, message: 'Detalhe do pedido.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updateOrderStatusControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const data = await updatePurchaseOrderStatusServiceLegacy(id, status);
    res.status(200).send({ data, message: 'Status atualizado.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updateOrderItemsControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const data = await updatePurchaseOrderItemsServiceLegacy(id, payload);
    res.status(200).send({ data, message: 'Itens atualizados.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const exportOrderControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const order = await getPurchaseOrderDetailServiceLegacy(id);

    if (!order) {
      res.status(404).send({ message: 'Pedido não encontrado' });
      return;
    }

    const exportData = {
      orderNumber: order.orderNumber,
      supplierName: order.supplier?.supplier_name || 'Fornecedor',
      items: order.items.map((item) => ({
        productName: item.product?.product_name || `Produto ${item.product?.id}`,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      totalValue: Number(order.totalValue),
    };

    const buffer = await exportOrderToExcelLegacy(exportData);

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
