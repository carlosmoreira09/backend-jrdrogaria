import { AppDataSource } from '../config/database';
import { Store } from '../entity/Store';

export const storeRepository = AppDataSource.getRepository(Store);
