import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Dados inválidos',
      errors: errors.array().map((e) => ({
        field: (e as any).path || (e as any).param,
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

export const validateQuotationCreate = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Data de prazo inválida'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items deve ser um array'),
  body('items.*.productId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do produto inválido'),
  body('items.*.quantities')
    .optional()
    .isObject()
    .withMessage('Quantidades devem ser um objeto'),
  handleValidationErrors,
];

export const validateQuotationUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da cotação inválido'),
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),
  body('status')
    .optional()
    .isIn(['draft', 'open', 'closed', 'completed'])
    .withMessage('Status inválido'),
  handleValidationErrors,
];

export const validateGenerateLinks = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da cotação inválido'),
  body('supplierIds')
    .isArray({ min: 1 })
    .withMessage('Deve selecionar pelo menos um fornecedor'),
  body('supplierIds.*')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor inválido'),
  handleValidationErrors,
];

export const validatePublicPrices = [
  param('token')
    .isLength({ min: 20 })
    .withMessage('Token inválido'),
  body('prices')
    .isArray()
    .withMessage('Preços deve ser um array'),
  body('prices.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID do produto inválido'),
  body('prices.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número positivo'),
  body('prices.*.available')
    .optional()
    .isBoolean()
    .withMessage('Disponibilidade deve ser verdadeiro ou falso'),
  body('submit')
    .optional()
    .isBoolean()
    .withMessage('Submit deve ser verdadeiro ou falso'),
  handleValidationErrors,
];

export const validateOrderCreate = [
  body('quotationId')
    .isInt({ min: 1 })
    .withMessage('ID da cotação inválido'),
  body('supplierId')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor inválido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Deve ter pelo menos um item'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID do produto inválido'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número positivo'),
  handleValidationErrors,
];

export const validateOrderStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do pedido inválido'),
  body('status')
    .isIn(['draft', 'confirmed', 'sent', 'delivered'])
    .withMessage('Status inválido'),
  handleValidationErrors,
];

export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  handleValidationErrors,
];
