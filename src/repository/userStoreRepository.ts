import { AppDataSource } from '../config/database';
import { UserStore } from '../entity/UserStore';

export const userStoreRepository = AppDataSource.getRepository(UserStore);
