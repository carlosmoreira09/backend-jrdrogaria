import { AppDataSource } from "../config/database";
import {Products} from "../entity/Products";

export const productsRepository = AppDataSource.getRepository(Products);