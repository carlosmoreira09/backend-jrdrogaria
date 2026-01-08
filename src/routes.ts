import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'reflect-metadata';
import swaggerUi from 'swagger-ui-express';
import shoppingListRoutes from "./routes/shoppingListRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import generalRoutes from "./routes/generalRoutes";
import quotationRoutes from "./routes/quotationRoutes";
import publicRoutes from "./routes/publicRoutes";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes";
import {loggingMiddleware} from "./middlewares/loggingMiddleware";
import { swaggerSpec } from "./config/swagger";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggingMiddleware); // Apply logging middleware to all routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/shopping', shoppingListRoutes);
app.use('/api/v1/general', generalRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/orders', purchaseOrderRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API - Sistema de Cotação',
}));

export default app;