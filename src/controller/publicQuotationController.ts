import { Request, Response } from 'express';
import {
  getSupplierQuotationByTokenService,
  saveSupplierPricesService,
} from '../service/supplierQuotationService';

export const getPublicQuotationController = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const data = await getSupplierQuotationByTokenService(token);
    if (!data) return res.status(404).send({ message: 'Link inválido ou expirado.' });
    res.status(200).send({ data, message: 'Dados da cotação.' });
  } catch (error) {
    res.sendStatus(400);
  }
};

export const savePublicPricesController = async (req: Request, res: Response) => {
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
