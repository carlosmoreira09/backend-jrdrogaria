/**
 * Billing Service Tests
 * Testes unitários para o serviço de billing
 */

import { PLAN_LIMITS, PLAN_PRICES, getPlanLimits } from '../service/billingService';

describe('Billing Service', () => {
  describe('PLAN_LIMITS', () => {
    it('should have correct limits for free plan', () => {
      expect(PLAN_LIMITS.free).toEqual({
        stores: 1,
        users: 2,
        quotationsPerMonth: 10,
        suppliers: 5,
        products: 100,
        historyDays: 30,
        whatsappEnabled: false,
        apiEnabled: false,
      });
    });

    it('should have correct limits for pro plan', () => {
      expect(PLAN_LIMITS.pro).toEqual({
        stores: 5,
        users: 10,
        quotationsPerMonth: 100,
        suppliers: 50,
        products: 1000,
        historyDays: 365,
        whatsappEnabled: true,
        apiEnabled: false,
      });
    });

    it('should have correct limits for enterprise plan', () => {
      expect(PLAN_LIMITS.enterprise.stores).toBe(Infinity);
      expect(PLAN_LIMITS.enterprise.users).toBe(Infinity);
      expect(PLAN_LIMITS.enterprise.whatsappEnabled).toBe(true);
      expect(PLAN_LIMITS.enterprise.apiEnabled).toBe(true);
    });
  });

  describe('PLAN_PRICES', () => {
    it('should have correct prices in centavos', () => {
      expect(PLAN_PRICES.free).toBe(0);
      expect(PLAN_PRICES.pro).toBe(19900); // R$ 199,00
      expect(PLAN_PRICES.enterprise).toBe(49900); // R$ 499,00
    });
  });

  describe('getPlanLimits', () => {
    it('should return correct limits for each plan', () => {
      expect(getPlanLimits('free')).toEqual(PLAN_LIMITS.free);
      expect(getPlanLimits('pro')).toEqual(PLAN_LIMITS.pro);
      expect(getPlanLimits('enterprise')).toEqual(PLAN_LIMITS.enterprise);
    });

    it('should return free limits for unknown plan', () => {
      expect(getPlanLimits('unknown' as any)).toEqual(PLAN_LIMITS.free);
    });
  });
});

describe('Plan Limit Validation', () => {
  it('free plan should not allow more than 1 store', () => {
    const limits = PLAN_LIMITS.free;
    expect(0 < limits.stores).toBe(true); // Can create first store
    expect(1 < limits.stores).toBe(false); // Cannot create second store
  });

  it('pro plan should allow up to 5 stores', () => {
    const limits = PLAN_LIMITS.pro;
    expect(4 < limits.stores).toBe(true); // Can create 5th store
    expect(5 < limits.stores).toBe(false); // Cannot create 6th store
  });

  it('enterprise plan should allow unlimited stores', () => {
    const limits = PLAN_LIMITS.enterprise;
    expect(1000 < limits.stores).toBe(true); // Can create any number
  });
});

describe('Feature Availability', () => {
  it('whatsapp should only be available for pro and enterprise', () => {
    expect(PLAN_LIMITS.free.whatsappEnabled).toBe(false);
    expect(PLAN_LIMITS.pro.whatsappEnabled).toBe(true);
    expect(PLAN_LIMITS.enterprise.whatsappEnabled).toBe(true);
  });

  it('api should only be available for enterprise', () => {
    expect(PLAN_LIMITS.free.apiEnabled).toBe(false);
    expect(PLAN_LIMITS.pro.apiEnabled).toBe(false);
    expect(PLAN_LIMITS.enterprise.apiEnabled).toBe(true);
  });
});
