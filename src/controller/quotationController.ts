import { Request, Response } from 'express';
import {
  createQuotationService,
  deleteQuotationService,
  getQuotationDetailService,
  listQuotationsService,
  updateQuotationService,
} from '../service/quotationService';
import { createSupplierQuotationsService } from '../service/supplierQuotationService';

export const listQuotationsController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const data = await listQuotationsService(tenantId);
    res.status(200).send({ data, message: 'Lista de cotações.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const getQuotationDetailController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const data = await getQuotationDetailService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Detalhe da cotação.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const createQuotationController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const payload = req.body;
    const result = await createQuotationService(payload, tenantId);
    res.status(201).send(result);
  } catch (error) {
    res.sendStatus(400);
  }
};

export const updateQuotationController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const payload = req.body;
    const data = await updateQuotationService(Number(req.params.id), payload, tenantId);
    res.status(200).send({ data, message: 'Cotação atualizada.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const deleteQuotationController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const data = await deleteQuotationService(Number(req.params.id), tenantId);
    res.status(200).send({ data, message: 'Cotação removida.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const generateSupplierLinksController = async (req: Request, res: Response) => {
  const tenantId = req.tenantId as number;
  if (!tenantId) return res.status(400).send({ message: 'Tenant não encontrado' });
  try {
    const quotationId = Number(req.params.id);
    const { supplierIds } = req.body as { supplierIds: number[] };
    const data = await createSupplierQuotationsService(quotationId, supplierIds);
    res.status(200).send({ data, message: 'Links gerados.' });
  } catch (error) {
    res.sendStatus(400);
  }
};
