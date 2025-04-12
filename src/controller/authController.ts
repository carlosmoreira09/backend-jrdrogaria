import { Request, Response } from 'express';
import {Users} from "../entity/Users";
import {loginAdmin, registerAdmin} from "../service/authService";
import {LoginAdminDTO} from "../schemas/auth/auth";

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

        res.send( { message: 'Usuário registrado com sucesso.' }).status(201)
    } catch (error) {
        res.sendStatus(400)
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
        res.send( { token: result.token, message: 'Login realizado com sucesso.' }).status(200)
    } catch (error) {
        res.sendStatus(401)
    }
};


