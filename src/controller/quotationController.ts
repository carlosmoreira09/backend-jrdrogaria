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
import { exportComparisonToExcel, exportBestPricesBySupplier } from '../utils/excelExporter';

export const listQuotationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await listQuotationsService();
    res.status(200).send({ data, message: 'Lista de cotações.' });
  } catch (error) {
    console.error('Erro ao listar cotações:', error);
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getQuotationDetailController = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getQuotationDetailService(Number(req.params.id));
    res.status(200).send({ data, message: 'Detalhe da cotação.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const createQuotationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    if (!req.tenant || !req.store) {
      res.status(400).send({ message: 'Tenant and Store are required' });
      return;
    }
    const result = await createQuotationService(payload, req.tenant, req.store);
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updateQuotationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    if (!req.tenant || !req.store) {
      res.status(400).send({ message: 'Tenant and Store are required' });
      return;
    }
    const data = await updateQuotationService(Number(req.params.id), payload, req.tenant, req.store);
    res.status(200).send({ data, message: 'Cotação atualizada.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const deleteQuotationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await deleteQuotationService(Number(req.params.id));
    res.status(200).send({ data, message: 'Cotação removida.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const generateSupplierLinksController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const { supplierIds } = req.body as { supplierIds: number[] };
    const data = await createSupplierQuotationsService(quotationId, supplierIds);
    res.status(200).send({ data, message: 'Links gerados.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getPriceComparisonController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const data = await getPriceComparisonService(quotationId);
    res.status(200).send({ data, message: 'Comparação de preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getBestPricesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const data = await getBestPricesService(quotationId);
    res.status(200).send({ data, message: 'Melhores preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const exportComparisonController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const comparison = await getPriceComparisonService(quotationId);
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

export const exportBestPricesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const comparison = await getPriceComparisonService(quotationId);
    const buffer = await exportBestPricesBySupplier(comparison);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pedidos_${comparison.quotationName.replace(/\s+/g, '_')}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};
