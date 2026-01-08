/**
 * Legacy Quotation Controller - v1/v2 compatible
 * Não requer headers X-Tenant-Slug ou X-Store-Id
 * DEPRECATED: Usar quotationController.ts para novas implementações
 */

import { Request, Response } from 'express';
import {
  createQuotationServiceLegacy,
  deleteQuotationServiceLegacy,
  getQuotationDetailServiceLegacy,
  listQuotationsServiceLegacy,
  updateQuotationServiceLegacy,
} from '../../service/legacy/quotationService.legacy';
import { createSupplierQuotationsServiceLegacy } from '../../service/legacy/supplierQuotationService.legacy';
import { getPriceComparisonServiceLegacy, getBestPricesServiceLegacy } from '../../service/legacy/priceComparisonService.legacy';
import { exportComparisonToExcelLegacy, exportBestPricesBySupplierLegacy } from '../../utils/legacy/excelExporter.legacy';

export const listQuotationsControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await listQuotationsServiceLegacy();
    res.status(200).send({ data, message: 'Lista de cotações.' });
  } catch (error) {
    console.error('Erro ao listar cotações:', error);
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getQuotationDetailControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await getQuotationDetailServiceLegacy(Number(req.params.id));
    res.status(200).send({ data, message: 'Detalhe da cotação.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const createQuotationControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const result = await createQuotationServiceLegacy(payload);
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const updateQuotationControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    const data = await updateQuotationServiceLegacy(Number(req.params.id), payload);
    res.status(200).send({ data, message: 'Cotação atualizada.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const deleteQuotationControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await deleteQuotationServiceLegacy(Number(req.params.id));
    res.status(200).send({ data, message: 'Cotação removida.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const generateSupplierLinksControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const { supplierIds } = req.body as { supplierIds: number[] };
    const data = await createSupplierQuotationsServiceLegacy(quotationId, supplierIds);
    res.status(200).send({ data, message: 'Links gerados.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getPriceComparisonControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const data = await getPriceComparisonServiceLegacy(quotationId);
    res.status(200).send({ data, message: 'Comparação de preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const getBestPricesControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const data = await getBestPricesServiceLegacy(quotationId);
    res.status(200).send({ data, message: 'Melhores preços.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const exportComparisonControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const comparison = await getPriceComparisonServiceLegacy(quotationId);
    const buffer = await exportComparisonToExcelLegacy(comparison);

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

export const exportBestPricesControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const quotationId = Number(req.params.id);
    const comparison = await getPriceComparisonServiceLegacy(quotationId);
    const buffer = await exportBestPricesBySupplierLegacy(comparison);

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
