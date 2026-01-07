import { AppDataSource } from '../config/database';
import { QuotationRequest } from '../entity/QuotationRequest';
import { SupplierPrice } from '../entity/SupplierPrice';

export type PriceComparison = {
  productId: number;
  productName: string;
  totalQuantity: number;
  quantities: {
    JR: number;
    GS: number;
    BARAO: number;
    LB: number;
  };
  prices: {
    supplierId: number;
    supplierName: string;
    unitPrice: number | null;
    available: boolean;
    observation?: string;
    totalPrice: number | null;
  }[];
  bestPrice: {
    supplierId: number;
    supplierName: string;
    unitPrice: number;
    totalPrice: number;
    savings: number;
  } | null;
};

export type ComparisonSummary = {
  quotationId: number;
  quotationName: string;
  totalProducts: number;
  respondedSuppliers: number;
  totalSuppliers: number;
  comparisons: PriceComparison[];
  supplierTotals: {
    supplierId: number;
    supplierName: string;
    totalValue: number;
    productsWithBestPrice: number;
    productsQuoted: number;
  }[];
  maxSavings: number;
};

export const getPriceComparisonService = async (
  quotationId: number,
  tenantId: number
): Promise<ComparisonSummary> => {
  const quotationRepo = AppDataSource.getRepository(QuotationRequest);
  const priceRepo = AppDataSource.getRepository(SupplierPrice);

  const quotation = await quotationRepo.findOne({
    where: { id: quotationId, tenant: { id: tenantId } },
    relations: [
      'items',
      'items.product',
      'supplierQuotations',
      'supplierQuotations.supplier',
    ],
  });

  if (!quotation) throw new Error('Cotação não encontrada');

  const submittedQuotations = quotation.supplierQuotations?.filter(
    (sq) => sq.status === 'submitted'
  ) || [];

  const allPrices = await priceRepo.find({
    where: {
      supplierQuotation: {
        quotationRequest: { id: quotationId },
        status: 'submitted',
      },
    },
    relations: ['supplierQuotation', 'supplierQuotation.supplier', 'product'],
  });

  const comparisons: PriceComparison[] = (quotation.items || []).map((item) => {
    const productPrices = allPrices.filter(
      (p) => p.product.id === item.product.id
    );

    const prices = submittedQuotations.map((sq) => {
      const priceEntry = productPrices.find(
        (p) => p.supplierQuotation.id === sq.id
      );
      return {
        supplierId: sq.supplier.id,
        supplierName: sq.supplier.supplier_name,
        unitPrice: priceEntry?.unitPrice ?? null,
        available: priceEntry?.available ?? false,
        observation: priceEntry?.observation,
        totalPrice:
          priceEntry?.unitPrice && item.totalQuantity
            ? Number(priceEntry.unitPrice) * Number(item.totalQuantity)
            : null,
      };
    });

    const availablePrices = prices.filter(
      (p) => p.available && p.unitPrice !== null
    );
    const sortedPrices = [...availablePrices].sort(
      (a, b) => (a.unitPrice || 0) - (b.unitPrice || 0)
    );

    let bestPrice: PriceComparison['bestPrice'] = null;
    if (sortedPrices.length > 0) {
      const best = sortedPrices[0];
      const worst = sortedPrices[sortedPrices.length - 1];
      bestPrice = {
        supplierId: best.supplierId,
        supplierName: best.supplierName,
        unitPrice: best.unitPrice!,
        totalPrice: best.totalPrice!,
        savings:
          sortedPrices.length > 1
            ? (worst.totalPrice || 0) - (best.totalPrice || 0)
            : 0,
      };
    }

    return {
      productId: item.product.id,
      productName: item.product.product_name,
      totalQuantity: Number(item.totalQuantity) || 0,
      quantities: item.quantities,
      prices,
      bestPrice,
    };
  });

  const supplierTotals = submittedQuotations.map((sq) => {
    let totalValue = 0;
    let productsWithBestPrice = 0;
    let productsQuoted = 0;

    comparisons.forEach((comp) => {
      const priceEntry = comp.prices.find((p) => p.supplierId === sq.supplier.id);
      if (priceEntry?.totalPrice) {
        totalValue += priceEntry.totalPrice;
        productsQuoted++;
      }
      if (comp.bestPrice?.supplierId === sq.supplier.id) {
        productsWithBestPrice++;
      }
    });

    return {
      supplierId: sq.supplier.id,
      supplierName: sq.supplier.supplier_name,
      totalValue,
      productsWithBestPrice,
      productsQuoted,
    };
  });

  const maxSavings = comparisons.reduce(
    (acc, comp) => acc + (comp.bestPrice?.savings || 0),
    0
  );

  return {
    quotationId: quotation.id,
    quotationName: quotation.name,
    totalProducts: quotation.items?.length || 0,
    respondedSuppliers: submittedQuotations.length,
    totalSuppliers: quotation.supplierQuotations?.length || 0,
    comparisons,
    supplierTotals,
    maxSavings,
  };
};

export const getBestPricesService = async (
  quotationId: number,
  tenantId: number
) => {
  const comparison = await getPriceComparisonService(quotationId, tenantId);

  return comparison.comparisons
    .filter((c) => c.bestPrice !== null)
    .map((c) => ({
      productId: c.productId,
      productName: c.productName,
      totalQuantity: c.totalQuantity,
      quantities: c.quantities,
      bestSupplier: c.bestPrice!.supplierName,
      bestSupplierId: c.bestPrice!.supplierId,
      unitPrice: c.bestPrice!.unitPrice,
      totalPrice: c.bestPrice!.totalPrice,
    }));
};
