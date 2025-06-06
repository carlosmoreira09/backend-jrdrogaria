import { Request, Response } from 'express';
import {
    createSupplierService,
    deleteSupplierService,
    findSupplierById,
    listSupplierService,
    updateSupplierService
} from "../service/supplierService";
import {Supplier} from "../entity/Supplier";

export const listSupplierController = async (req: Request, res: Response) => {

    try {
        const result = await listSupplierService()
        res.send( { data: result, message: 'Lista de Fornecedores.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}

export const createSupplierController = async (req: Request, res: Response) => {

    try {
        const supplierData: Supplier = req.body;

        const result = await createSupplierService(supplierData)

        res.send( { data: result, message: 'Fornecedor cadastrado.' }).status(201)
    } catch (error) {
        res.sendStatus(400)
    }
}


export const updateSupplierController = async (req: Request, res: Response) => {
    try {
        const supplierData: Supplier = req.body;

        const result = await updateSupplierService(supplierData)

        res.send( { data: result, message: 'Fornecedor atualizado.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}
export const deleteSupplierController = async (req: Request, res: Response) => {
    try {
        const id_product = req.params.id
        const result = await deleteSupplierService(parseInt(id_product))
        res.send( { data: result, message: 'Fornecedor removido.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}

export const getSupplierDetailsController = async (req: Request, res: Response) => {
    try {
        const id_product = req.params.id as string
        const result = await findSupplierById(parseInt(id_product));
        res.send( { data: result, message: 'Dados do Fornecedor.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}
