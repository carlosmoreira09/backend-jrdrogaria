/**
 * Billing Controller - Endpoints de billing e planos
 */

import { Request, Response } from 'express';
import {
  getSubscriptionDetails,
  updateSubscriptionPlan,
  PLAN_LIMITS,
  PLAN_PRICES,
  SubscriptionPlan,
} from '../service/billingService';

export const getSubscriptionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant not identified' });
      return;
    }

    const details = await getSubscriptionDetails(tenantId);
    res.status(200).json({ data: details });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlansController = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = Object.entries(PLAN_LIMITS).map(([key, limits]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      price: PLAN_PRICES[key as SubscriptionPlan],
      priceFormatted: `R$ ${(PLAN_PRICES[key as SubscriptionPlan] / 100).toFixed(2).replace('.', ',')}`,
      limits,
    }));

    res.status(200).json({ data: plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const upgradeSubscriptionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = req.tenant?.id;
    const { plan } = req.body;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant not identified' });
      return;
    }

    if (!plan || !['free', 'pro', 'enterprise'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan. Must be free, pro, or enterprise' });
      return;
    }

    const subscription = await updateSubscriptionPlan(tenantId, plan as SubscriptionPlan);
    const details = await getSubscriptionDetails(tenantId);

    res.status(200).json({
      data: details,
      message: `Plano atualizado para ${plan.toUpperCase()} com sucesso!`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
