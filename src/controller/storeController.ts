/**
 * Store Controller v3 - Multi-tenant
 */

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Store } from '../entity/Store';

const storeRepository = AppDataSource.getRepository(Store);

export const listStoresController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.tenant) {
      res.status(400).json({ message: 'Tenant is required' });
      return;
    }

    const stores = await storeRepository.find({
      where: { tenant: { id: req.tenant.id } },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    res.status(200).json({ data: stores, message: 'Lista de lojas' });
  } catch (error) {
    console.error('Error listing stores:', error);
    res.status(500).json({ message: 'Erro ao listar lojas' });
  }
};

export const getStoreController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.tenant) {
      res.status(400).json({ message: 'Tenant is required' });
      return;
    }

    const store = await storeRepository.findOne({
      where: { 
        id: Number(req.params.id),
        tenant: { id: req.tenant.id } 
      },
    });

    if (!store) {
      res.status(404).json({ message: 'Loja não encontrada' });
      return;
    }

    res.status(200).json({ data: store, message: 'Detalhe da loja' });
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ message: 'Erro ao buscar loja' });
  }
};
