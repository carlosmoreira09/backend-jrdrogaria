/**
 * Legacy Public Controller - v1/v2 compatible
 * Para links públicos de fornecedores
 * DEPRECATED: Usar publicController.ts para novas implementações
 */

import { Request, Response } from 'express';
import {
  getSupplierQuotationByTokenServiceLegacy,
  saveSupplierPricesServiceLegacy,
  submitPublicQuotationServiceLegacy,
} from '../../service/legacy/supplierQuotationService.legacy';

export const getQuotationByTokenControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const data = await getSupplierQuotationByTokenServiceLegacy(token);
    
    if (!data) {
      res.status(404).send({ message: 'Link inválido ou expirado' });
      return;
    }

    res.status(200).send({ data, message: 'Cotação encontrada.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const savePricesControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { prices, submit } = req.body;
    
    const data = await saveSupplierPricesServiceLegacy(token, prices, submit);
    res.status(200).send({ data, message: submit ? 'Cotação enviada!' : 'Preços salvos.' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};

export const submitPublicQuotationControllerLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { supplierData, prices } = req.body;
    
    const data = await submitPublicQuotationServiceLegacy(token, supplierData, prices);
    res.status(201).send({ data, message: 'Cotação enviada com sucesso!' });
  } catch (error) {
    res.status(400).send({ message: (error as Error).message });
  }
};
