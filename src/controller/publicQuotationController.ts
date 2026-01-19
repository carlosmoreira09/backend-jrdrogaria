import { Request, Response } from 'express';
import {
  getSupplierQuotationByTokenService,
  saveSupplierPricesService,
  getQuotationForAnonymousService,
  saveAnonymousSupplierPricesService,
} from '../service/supplierQuotationService';

export const getPublicQuotationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token;
    const data = await getSupplierQuotationByTokenService(token);
    if (!data) {
      res.status(404).send({ message: 'Link inválido ou expirado.' });
      return;
    }
    res.status(200).send({ data, message: 'Dados da cotação.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const savePublicPricesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token;
    const prices = req.body?.prices ?? [];
    const submit = !!req.body?.submit;
    const result = await saveSupplierPricesService(token, prices, submit);
    res.status(200).send(result);
  } catch (error) {
    res.sendStatus(400);
  }
};

// Get quotation by public_token for anonymous supplier
export const getQuotationForAnonymousController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token;
    if (!token) {
      res.status(400).send({ message: 'Token inválido' });
      return;
    }
    const data = await getQuotationForAnonymousService(token);
    if (!data) {
      res.status(404).send({ message: 'Link inválido ou expirado.' });
      return;
    }
    res.status(200).send({ data, message: 'Dados da cotação.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

// Save anonymous supplier prices
export const saveAnonymousSupplierPricesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token;
    if (!token) {
      res.status(400).send({ message: 'Token inválido' });
      return;
    }
    const { supplier, prices } = req.body;
    if (!supplier?.supplierName) {
      res.status(400).send({ message: 'Nome do fornecedor é obrigatório' });
      return;
    }
    const result = await saveAnonymousSupplierPricesService(token, supplier, prices ?? []);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: (error as Error).message || 'Erro ao salvar' });
  }
};
