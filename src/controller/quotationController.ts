import { Request, Response } from 'express';
import {
  createQuotationService,
  deleteQuotationService,
  getQuotationDetailService,
  listQuotationsService,
  updateQuotationService,
} from '../service/quotationService';
import { createSupplierQuotationsService } from '../service/supplierQuotationService';
import { getPriceComparisonService, getBestPricesService } from '../service/priceComparisonService';
import { exportComparisonToExcel } from '../utils/excelExporter';

export const listQuotationsController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await listQuotationsService(tenantId);
    res.status(200).send({ data, message: 'Lista de cotações.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const getQuotationDetailController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await getQuotationDetailService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Detalhe da cotação.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const createQuotationController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const payload = req.body;
    const result = await createQuotationService(payload, tenantId);
    res.status(201).send(result);
  } catch (error) {
    res.sendStatus(400);
  }
};

export const updateQuotationController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const payload = req.body;
    const data = await updateQuotationService(Number(req.params.id), payload, tenantId);
    res.status(200).send({ data, message: 'Cotação atualizada.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const deleteQuotationController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const data = await deleteQuotationService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Cotação removida.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const generateSupplierLinksController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const quotationId = Number(req.params.id);
    const { supplierIds } = req.body as { supplierIds: number[] };
    const data = await createSupplierQuotationsService(quotationId, supplierIds);
    res.status(200).send({ data, message: 'Links gerados.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const getPriceComparisonController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const quotationId = Number(req.params.id);
    const data = await getPriceComparisonService(quotationId, tenantId);
    res.status(200).send({ data, message: 'Comparação de preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getBestPricesController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const quotationId = Number(req.params.id);
    const data = await getBestPricesService(quotationId, tenantId);
    res.status(200).send({ data, message: 'Melhores preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const exportComparisonController = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId as number;
  if (!tenantId) {
    res.status(400).send({ message: 'Tenant não encontrado' });
    return;
  }
  try {
    const quotationId = Number(req.params.id);
    const comparison = await getPriceComparisonService(quotationId, tenantId);
    const buffer = await exportComparisonToExcel(comparison);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=comparacao_${comparison.quotationName.replace(/\s+/g, '_')}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};
