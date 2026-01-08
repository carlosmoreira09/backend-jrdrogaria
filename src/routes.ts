import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'reflect-metadata';
import swaggerUi from 'swagger-ui-express';

// v1 Legacy Routes (retrocompatível - sem multi-tenant)
import shoppingListRoutes from "./routes/shoppingListRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import generalRoutes from "./routes/generalRoutes";
import quotationRoutes from "./routes/quotationRoutes";
import publicRoutes from "./routes/publicRoutes";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes";

// v3 Multi-tenant Routes
import quotationRoutesV3 from "./routes/v3/quotationRoutes.v3";
import purchaseOrderRoutesV3 from "./routes/v3/purchaseOrderRoutes.v3";
import productRoutesV3 from "./routes/v3/productRoutes.v3";
import supplierRoutesV3 from "./routes/v3/supplierRoutes.v3";
import storeRoutesV3 from "./routes/v3/storeRoutes.v3";
import authRoutesV3 from "./routes/v3/authRoutes.v3";

import {loggingMiddleware} from "./middlewares/loggingMiddleware";
import { swaggerSpec } from "./config/swagger";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================
// v1 Legacy Routes - Retrocompatível (sem multi-tenant)
// =============================================
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/shopping', shoppingListRoutes);
app.use('/api/v1/general', generalRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/orders', purchaseOrderRoutes);

// =============================================
// v3 Multi-tenant Routes - Requer X-Tenant-Slug e X-Store-Id
// =============================================
app.use('/api/v3/auth', authRoutesV3);
app.use('/api/v3/quotations', quotationRoutesV3);
app.use('/api/v3/orders', purchaseOrderRoutesV3);
app.use('/api/v3/products', productRoutesV3);
app.use('/api/v3/suppliers', supplierRoutesV3);
app.use('/api/v3/stores', storeRoutesV3);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API - Sistema de Cotação',
}));

export default app;