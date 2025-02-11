import { AppDataSource } from "../config/database";
import {Supplier} from "../entity/Supplier";

export const supplierRepository = AppDataSource.getRepository(Supplier);