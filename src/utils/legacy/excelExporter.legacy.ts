/**
 * Legacy Excel Exporter - v1/v2 compatible
 * DEPRECATED: Usar excelExporter.ts para novas implementações
 */

import ExcelJS from 'exceljs';
import { ComparisonSummaryLegacy } from '../../service/legacy/priceComparisonService.legacy';

export const exportComparisonToExcelLegacy = async (
  comparison: ComparisonSummaryLegacy
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotação';
  workbook.created = new Date();

  const comparisonSheet = workbook.addWorksheet('Comparação de Preços');

  const headerRow = ['Produto', 'Qtd Total'];
  comparison.supplierTotals.forEach((s) => {
    headerRow.push(s.supplierName);
    headerRow.push('Total');
  });
  headerRow.push('Melhor Fornecedor');
  headerRow.push('Economia');

  comparisonSheet.addRow(headerRow);

  const headerRowObj = comparisonSheet.getRow(1);
  headerRowObj.font = { bold: true };
  headerRowObj.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };
  headerRowObj.alignment = { horizontal: 'center' };

  comparison.comparisons.forEach((comp) => {
    const row: (string | number)[] = [comp.productName, comp.quantity];

    comparison.supplierTotals.forEach((supplier) => {
      const priceEntry = comp.prices.find((p) => p.supplierId === supplier.supplierId);
      if (priceEntry?.available && priceEntry.unitPrice !== null) {
        row.push(priceEntry.unitPrice);
        row.push(priceEntry.totalPrice || 0);
      } else {
        row.push('Indisponível');
        row.push('-');
      }
    });

    row.push(comp.bestPrice?.supplierName || '-');
    row.push(comp.bestPrice?.savings || 0);

    const dataRow = comparisonSheet.addRow(row);

    if (comp.bestPrice) {
      const supplierIndex = comparison.supplierTotals.findIndex(
        (s) => s.supplierId === comp.bestPrice?.supplierId
      );
      if (supplierIndex !== -1) {
        const cellIndex = 3 + supplierIndex * 2;
        dataRow.getCell(cellIndex).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' },
        };
      }
    }
  });

  comparisonSheet.columns.forEach((column) => {
    column.width = 15;
  });
  comparisonSheet.getColumn(1).width = 30;

  const summarySheet = workbook.addWorksheet('Resumo por Fornecedor');

  summarySheet.addRow(['Fornecedor', 'Total Cotado', 'Melhores Preços', 'Produtos Cotados']);
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.font = { bold: true };
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };

  comparison.supplierTotals
    .sort((a, b) => a.totalValue - b.totalValue)
    .forEach((supplier, idx) => {
      const row = summarySheet.addRow([
        supplier.supplierName,
        supplier.totalValue,
        supplier.productsWithBestPrice,
        supplier.productsQuoted,
      ]);

      if (idx === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' },
        };
      }
    });

  summarySheet.getColumn(2).numFmt = 'R$ #,##0.00';
  summarySheet.columns.forEach((column) => {
    column.width = 20;
  });

  summarySheet.addRow([]);
  summarySheet.addRow(['Economia Máxima Possível:', comparison.maxSavings]);
  summarySheet.getCell(`B${summarySheet.rowCount}`).numFmt = 'R$ #,##0.00';

  const bestPricesSheet = workbook.addWorksheet('Melhores Preços');

  bestPricesSheet.addRow([
    'Produto',
    'Quantidade',
    'Melhor Fornecedor',
    'Preço Unit.',
    'Total',
  ]);
  const bestHeader = bestPricesSheet.getRow(1);
  bestHeader.font = { bold: true };
  bestHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };

  comparison.comparisons
    .filter((c) => c.bestPrice !== null)
    .forEach((comp) => {
      bestPricesSheet.addRow([
        comp.productName,
        comp.quantity,
        comp.bestPrice!.supplierName,
        comp.bestPrice!.unitPrice,
        comp.bestPrice!.totalPrice,
      ]);
    });

  bestPricesSheet.getColumn(4).numFmt = 'R$ #,##0.00';
  bestPricesSheet.getColumn(5).numFmt = 'R$ #,##0.00';
  bestPricesSheet.columns.forEach((column) => {
    column.width = 15;
  });
  bestPricesSheet.getColumn(1).width = 30;

  return workbook.xlsx.writeBuffer();
};

export const exportBestPricesBySupplierLegacy = async (
  comparison: ComparisonSummaryLegacy
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotação';
  workbook.created = new Date();

  const productsBySupplier: Record<number, {
    supplierName: string;
    products: {
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  }> = {};

  comparison.comparisons
    .filter((c) => c.bestPrice !== null)
    .forEach((comp) => {
      const supplierId = comp.bestPrice!.supplierId;
      if (!productsBySupplier[supplierId]) {
        productsBySupplier[supplierId] = {
          supplierName: comp.bestPrice!.supplierName,
          products: [],
        };
      }
      productsBySupplier[supplierId].products.push({
        productName: comp.productName,
        quantity: comp.quantity,
        unitPrice: comp.bestPrice!.unitPrice,
        totalPrice: comp.bestPrice!.totalPrice,
      });
    });

  Object.entries(productsBySupplier).forEach(([_, supplierData]) => {
    const sheetName = supplierData.supplierName.substring(0, 31);
    const sheet = workbook.addWorksheet(sheetName);

    sheet.addRow(['PEDIDO - ' + supplierData.supplierName]);
    sheet.mergeCells('A1:D1');
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.addRow(['Data:', new Date().toLocaleDateString('pt-BR')]);
    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Produto',
      'Quantidade',
      'Preço Unit.',
      'Total',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };

    let grandTotal = 0;
    supplierData.products.forEach((product) => {
      sheet.addRow([
        product.productName,
        product.quantity,
        product.unitPrice,
        product.totalPrice,
      ]);
      grandTotal += product.totalPrice;
    });

    sheet.addRow([]);
    const totalRow = sheet.addRow(['', 'TOTAL:', '', grandTotal]);
    totalRow.font = { bold: true };
    totalRow.getCell(4).numFmt = 'R$ #,##0.00';

    sheet.getColumn(3).numFmt = 'R$ #,##0.00';
    sheet.getColumn(4).numFmt = 'R$ #,##0.00';
    sheet.getColumn(1).width = 30;
    for (let i = 2; i <= 4; i++) {
      sheet.getColumn(i).width = 12;
    }
  });

  const summarySheet = workbook.addWorksheet('Resumo');
  summarySheet.addRow(['Fornecedor', 'Total de Produtos', 'Valor Total']);
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.font = { bold: true };
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };

  let grandTotal = 0;
  Object.entries(productsBySupplier).forEach(([_, supplierData]) => {
    const total = supplierData.products.reduce((sum, p) => sum + p.totalPrice, 0);
    grandTotal += total;
    summarySheet.addRow([
      supplierData.supplierName,
      supplierData.products.length,
      total,
    ]);
  });

  summarySheet.addRow([]);
  const totalRow = summarySheet.addRow(['TOTAL GERAL', '', grandTotal]);
  totalRow.font = { bold: true };

  summarySheet.getColumn(3).numFmt = 'R$ #,##0.00';
  summarySheet.columns.forEach((column) => {
    column.width = 20;
  });

  return workbook.xlsx.writeBuffer();
};

export const exportOrderToExcelLegacy = async (
  order: {
    orderNumber: string;
    supplierName: string;
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
    totalValue: number;
  }
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotação';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Pedido');

  sheet.addRow(['PEDIDO DE COMPRA']);
  sheet.mergeCells('A1:D1');
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.addRow([]);
  sheet.addRow(['Número do Pedido:', order.orderNumber]);
  sheet.addRow(['Fornecedor:', order.supplierName]);
  sheet.addRow(['Data:', new Date().toLocaleDateString('pt-BR')]);
  sheet.addRow([]);

  const itemsHeader = sheet.addRow([
    'Produto',
    'Quantidade',
    'Preço Unit.',
    'Subtotal',
  ]);
  itemsHeader.font = { bold: true };
  itemsHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };

  order.items.forEach((item) => {
    sheet.addRow([
      item.productName,
      item.quantity,
      item.unitPrice,
      item.subtotal,
    ]);
  });

  sheet.addRow([]);
  const totalRow = sheet.addRow(['', 'TOTAL:', '', order.totalValue]);
  totalRow.font = { bold: true };
  totalRow.getCell(4).numFmt = 'R$ #,##0.00';

  sheet.getColumn(3).numFmt = 'R$ #,##0.00';
  sheet.getColumn(4).numFmt = 'R$ #,##0.00';
  sheet.getColumn(1).width = 30;
  for (let i = 2; i <= 4; i++) {
    sheet.getColumn(i).width = 12;
  }

  return workbook.xlsx.writeBuffer();
};
