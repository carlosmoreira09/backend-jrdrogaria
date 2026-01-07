import ExcelJS from 'exceljs';
import { ComparisonSummary } from '../service/priceComparisonService';

export const exportComparisonToExcel = async (
  comparison: ComparisonSummary
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotação';
  workbook.created = new Date();

  // Sheet 1: Comparação de Preços
  const comparisonSheet = workbook.addWorksheet('Comparação de Preços');

  // Header row with supplier names
  const headerRow = ['Produto', 'Qtd Total'];
  comparison.supplierTotals.forEach((s) => {
    headerRow.push(s.supplierName);
    headerRow.push('Total');
  });
  headerRow.push('Melhor Fornecedor');
  headerRow.push('Economia');

  comparisonSheet.addRow(headerRow);

  // Style header
  const headerRowObj = comparisonSheet.getRow(1);
  headerRowObj.font = { bold: true };
  headerRowObj.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };
  headerRowObj.alignment = { horizontal: 'center' };

  // Data rows
  comparison.comparisons.forEach((comp) => {
    const row: (string | number)[] = [comp.productName, comp.totalQuantity];

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

    // Highlight best price cells
    if (comp.bestPrice) {
      const supplierIndex = comparison.supplierTotals.findIndex(
        (s) => s.supplierId === comp.bestPrice?.supplierId
      );
      if (supplierIndex !== -1) {
        const cellIndex = 3 + supplierIndex * 2; // 2 columns per supplier
        dataRow.getCell(cellIndex).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' },
        };
      }
    }
  });

  // Auto-fit columns
  comparisonSheet.columns.forEach((column) => {
    column.width = 15;
  });
  comparisonSheet.getColumn(1).width = 30; // Product name column

  // Sheet 2: Resumo por Fornecedor
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

      // Highlight best supplier
      if (idx === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' },
        };
      }
    });

  // Format currency columns
  summarySheet.getColumn(2).numFmt = 'R$ #,##0.00';
  summarySheet.columns.forEach((column) => {
    column.width = 20;
  });

  // Add summary info
  summarySheet.addRow([]);
  summarySheet.addRow(['Economia Máxima Possível:', comparison.maxSavings]);
  summarySheet.getCell(`B${summarySheet.rowCount}`).numFmt = 'R$ #,##0.00';

  // Sheet 3: Melhores Preços (para pedidos)
  const bestPricesSheet = workbook.addWorksheet('Melhores Preços');

  bestPricesSheet.addRow([
    'Produto',
    'Qtd Total',
    'JR',
    'GS',
    'BARÃO',
    'LB',
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
        comp.totalQuantity,
        comp.quantities.JR,
        comp.quantities.GS,
        comp.quantities.BARAO,
        comp.quantities.LB,
        comp.bestPrice!.supplierName,
        comp.bestPrice!.unitPrice,
        comp.bestPrice!.totalPrice,
      ]);
    });

  bestPricesSheet.getColumn(8).numFmt = 'R$ #,##0.00';
  bestPricesSheet.getColumn(9).numFmt = 'R$ #,##0.00';
  bestPricesSheet.columns.forEach((column) => {
    column.width = 15;
  });
  bestPricesSheet.getColumn(1).width = 30;

  return workbook.xlsx.writeBuffer();
};

// Export best prices grouped by supplier (one sheet per supplier)
export const exportBestPricesBySupplier = async (
  comparison: ComparisonSummary
): Promise<ExcelJS.Buffer> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotação';
  workbook.created = new Date();

  // Group products by best supplier
  const productsBySupplier: Record<number, {
    supplierName: string;
    products: {
      productName: string;
      totalQuantity: number;
      quantities: { JR: number; GS: number; BARAO: number; LB: number };
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
        totalQuantity: comp.totalQuantity,
        quantities: comp.quantities,
        unitPrice: comp.bestPrice!.unitPrice,
        totalPrice: comp.bestPrice!.totalPrice,
      });
    });

  // Create a sheet for each supplier
  Object.entries(productsBySupplier).forEach(([_, supplierData]) => {
    const sheetName = supplierData.supplierName.substring(0, 31); // Excel max sheet name is 31 chars
    const sheet = workbook.addWorksheet(sheetName);

    // Header info
    sheet.addRow(['PEDIDO - ' + supplierData.supplierName]);
    sheet.mergeCells('A1:G1');
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.addRow(['Data:', new Date().toLocaleDateString('pt-BR')]);
    sheet.addRow([]);

    // Column headers
    const headerRow = sheet.addRow([
      'Produto',
      'Qtd Total',
      'JR',
      'GS',
      'BARÃO',
      'LB',
      'Preço Unit.',
      'Total',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };

    // Data rows
    let grandTotal = 0;
    supplierData.products.forEach((product) => {
      sheet.addRow([
        product.productName,
        product.totalQuantity,
        product.quantities.JR,
        product.quantities.GS,
        product.quantities.BARAO,
        product.quantities.LB,
        product.unitPrice,
        product.totalPrice,
      ]);
      grandTotal += product.totalPrice;
    });

    // Total row
    sheet.addRow([]);
    const totalRow = sheet.addRow(['', '', '', '', '', 'TOTAL:', '', grandTotal]);
    totalRow.font = { bold: true };
    totalRow.getCell(8).numFmt = 'R$ #,##0.00';

    // Format columns
    sheet.getColumn(7).numFmt = 'R$ #,##0.00';
    sheet.getColumn(8).numFmt = 'R$ #,##0.00';
    sheet.getColumn(1).width = 30;
    for (let i = 2; i <= 8; i++) {
      sheet.getColumn(i).width = 12;
    }
  });

  // Add a summary sheet
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

export const exportOrderToExcel = async (
  order: {
    orderNumber: string;
    supplierName: string;
    items: {
      productName: string;
      quantities: { JR: number; GS: number; BARAO: number; LB: number };
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

  // Header info
  sheet.addRow(['PEDIDO DE COMPRA']);
  sheet.mergeCells('A1:G1');
  sheet.getCell('A1').font = { bold: true, size: 16 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.addRow([]);
  sheet.addRow(['Número do Pedido:', order.orderNumber]);
  sheet.addRow(['Fornecedor:', order.supplierName]);
  sheet.addRow(['Data:', new Date().toLocaleDateString('pt-BR')]);
  sheet.addRow([]);

  // Items header
  const itemsHeader = sheet.addRow([
    'Produto',
    'JR',
    'GS',
    'BARÃO',
    'LB',
    'Preço Unit.',
    'Subtotal',
  ]);
  itemsHeader.font = { bold: true };
  itemsHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' },
  };

  // Items
  order.items.forEach((item) => {
    sheet.addRow([
      item.productName,
      item.quantities.JR,
      item.quantities.GS,
      item.quantities.BARAO,
      item.quantities.LB,
      item.unitPrice,
      item.subtotal,
    ]);
  });

  // Total
  sheet.addRow([]);
  const totalRow = sheet.addRow(['', '', '', '', 'TOTAL:', '', order.totalValue]);
  totalRow.font = { bold: true };
  totalRow.getCell(7).numFmt = 'R$ #,##0.00';

  // Format columns
  sheet.getColumn(6).numFmt = 'R$ #,##0.00';
  sheet.getColumn(7).numFmt = 'R$ #,##0.00';
  sheet.getColumn(1).width = 30;
  for (let i = 2; i <= 7; i++) {
    sheet.getColumn(i).width = 12;
  }

  return workbook.xlsx.writeBuffer();
};
