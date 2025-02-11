import { AppDataSource } from "../config/database";
import {Users} from "../entity/Users";

export const usersRepository = AppDataSource.getRepository(Users);