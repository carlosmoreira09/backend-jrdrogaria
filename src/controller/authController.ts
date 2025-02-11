import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/httpResponses';
import {Users} from "../entity/Users";
import {loginAdmin, registerAdmin} from "../service/authService";
import {LoginAdminDTO} from "../types/enums/auth/auth";

export const registerAdminController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Users']
    #swagger.summary = 'Register a Users'
    #swagger.description = 'Route to create a new admin/doctor'
    */
    try {
        const newAdmin: Users = req.body;
        const tenantId = req.headers["x-tenant-id"] as string

        const result = await registerAdmin(
            newAdmin,
            parseInt(tenantId)
        );

        res.send(successResponse(res, result, 'Users registrado com sucesso', 201))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
};



export const loginController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Auth']
     #swagger.summary = 'Login as Users or Doctor'
     */
    try {
        const loginData: LoginAdminDTO = req.body;

        const result = await loginAdmin(loginData);

        res.send(successResponse(res, { token: result.token }, 'Login realizado com sucesso.'))
    } catch (error) {
        res.send(errorResponse(res, error, 401))
    }
};


