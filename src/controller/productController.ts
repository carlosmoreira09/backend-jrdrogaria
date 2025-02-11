import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/httpResponses';
import {
    createProductService,
    deleteProdutoService, findProductById,
    listProductsService,
    updateProductService
} from "../service/productService";
import {Products} from "../entity/Products";

export const listProductsController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const result = await listProductsService(tenantId)
        res.send(successResponse(res, result, 'Listagem de produtos', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}
export const getProductDetailsController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const id_product = req.params.id as string
        const result = await findProductById(parseInt(id_product), tenantId);
        res.send(successResponse(res, result, 'Listagem de produtos', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}
export const createProductController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const productData: Products = req.body;

        const result = await createProductService(productData, tenantId)

        res.send(successResponse(res, result, 'Produto cadastrado', 201))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}


export const updateProductController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const productData: Products = req.body;

        const result = await updateProductService(productData, tenantId)

        res.send(successResponse(res, result, 'Produto atualizado', 201))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}
export const deleteProductController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const id_product = req.params.id
        const result = await deleteProdutoService(parseInt(id_product))
        res.send(successResponse(res, result, 'Produto removido', 200))
    } catch (error) {
        res.send(errorResponse(res, error))
    }
}