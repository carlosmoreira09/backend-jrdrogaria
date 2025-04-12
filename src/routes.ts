import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'reflect-metadata';
import shoppingListRoutes from "./routes/shoppingListRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import generalRoutes from "./routes/generalRoutes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/shopping', shoppingListRoutes);
app.use('/api/v1/general', generalRoutes);


export default app;