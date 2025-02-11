import { AppDataSource } from "../config/database";
import {Tenant} from "../entity/Tenant";

export const tenantRepository = AppDataSource.getRepository(Tenant);