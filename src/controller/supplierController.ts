import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/httpResponses';
import {
    createSupplierService,
    deleteSupplierService, findSupplierById,
    listSupplierService,
    updateSupplierService
} from "../service/supplierService";
import {Supplier} from "../entity/Supplier";
import {findProductById} from "../service/productService";

export const listSupplierController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const result = await listSupplierService(tenantId)
        res.send(successResponse(res, result, 'Listagem de produtos', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}

export const createSupplierController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const supplierData: Supplier = req.body;

        const result = await createSupplierService(supplierData, tenantId)

        res.send(successResponse(res, result, 'Produto cadastrado', 201))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}


export const updateSupplierController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const supplierData: Supplier = req.body;

        const result = await updateSupplierService(supplierData)

        res.send(successResponse(res, result, 'Produto atualizado', 201))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}
export const deleteSupplierController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const id_product = req.params.id
        const result = await deleteSupplierService(parseInt(id_product))
        res.send(successResponse(res, result, 'Produto removido', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}

export const getSupplierDetailsController = async (req: Request, res: Response) => {
    try {
        const id_product = req.params.id as string
        const result = await findSupplierById(parseInt(id_product));
        res.send(successResponse(res, result, 'Listagem de produtos', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}