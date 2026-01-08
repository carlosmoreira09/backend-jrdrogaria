import { DataSource } from 'typeorm';

import dotenv from 'dotenv';
import { Users } from "../entity/Users";
import { Products } from "../entity/Products";
import { ShoppingList } from "../entity/ShoppingList";
import { Supplier } from "../entity/Supplier";
import { Tenant } from "../entity/Tenant";
import { Store } from "../entity/Store";
import { UserStore } from "../entity/UserStore";
import { QuotationRequest } from "../entity/QuotationRequest";
import { QuotationItem } from "../entity/QuotationItem";
import { SupplierQuotation } from "../entity/SupplierQuotation";
import { SupplierPrice } from "../entity/SupplierPrice";
import { PurchaseOrder } from "../entity/PurchaseOrder";
import { PurchaseOrderItem } from "../entity/PurchaseOrderItem";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        Users,
        Products,
        ShoppingList,
        Supplier,
        Tenant,
        Store,
        UserStore,
        QuotationRequest,
        QuotationItem,
        SupplierQuotation,
        SupplierPrice,
        PurchaseOrder,
        PurchaseOrderItem
    ],
    synchronize: true,
    logging: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');
    } catch (error) {
        console.error('Error during Data Source initialization:', error);
        throw error;
    }
};
