import { AppDataSource } from "../config/database";
import {ShoppingList} from "../entity/ShoppingList";

export const shoppingListRepository = AppDataSource.getRepository(ShoppingList);