/**
 * Plan Limit Middleware - Verifica limites por plano
 */

import { Request, Response, NextFunction } from 'express';
import { checkPlanLimit, ResourceType } from '../service/billingService';

export const checkPlanLimitMiddleware = (resource: ResourceType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified' });
      }

      const result = await checkPlanLimit(tenantId, resource);

      if (!result.allowed) {
        return res.status(403).json({
          error: 'Plan limit exceeded',
          details: {
            resource,
            current: result.current,
            limit: result.limit,
            plan: result.plan,
            message: `Você atingiu o limite de ${result.limit} ${resource} do plano ${result.plan.toUpperCase()}. Faça upgrade para continuar.`,
          },
        });
      }

      next();
    } catch (error: any) {
      console.error('Error checking plan limit:', error);
      next();
    }
  };
};

export const requireFeature = (feature: 'whatsapp' | 'api') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant not identified' });
      }

      const { checkPlanLimit: _, getPlanLimits, getOrCreateSubscription } = await import('../service/billingService');
      
      const subscription = await getOrCreateSubscription(tenantId);
      const limits = getPlanLimits(subscription.plan);

      const featureEnabled = feature === 'whatsapp' ? limits.whatsappEnabled : limits.apiEnabled;

      if (!featureEnabled) {
        return res.status(403).json({
          error: 'Feature not available',
          details: {
            feature,
            plan: subscription.plan,
            message: `O recurso ${feature} não está disponível no plano ${subscription.plan.toUpperCase()}. Faça upgrade para Pro ou Enterprise.`,
          },
        });
      }

      next();
    } catch (error: any) {
      console.error('Error checking feature:', error);
      next();
    }
  };
};
