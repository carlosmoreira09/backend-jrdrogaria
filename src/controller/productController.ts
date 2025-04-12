import { Request, Response } from 'express';
import {
    createProductService,
    deleteProdutoService, findProductById,
    listProductsService,
    updateProductService
} from "../service/productService";
import {Products} from "../entity/Products";
import {getTotalAmount} from "../service/generalService";

export const listProductsController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const result = await listProductsService(tenantId)
        res.send( { data: result, message: 'Lista de Produtos.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
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
        res.send( { data: result, message: 'Detalhe do Produto.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
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

        res.send( { data: result, message: 'Produto cadastrado.' }).status(201)
    } catch (error) {
        res.sendStatus(400)
    }
}
export const createMultipleProductController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const productData: Products[] = req.body;
        productData.map( async (product) => {
            await createProductService(product, tenantId)
        } )

        res.send( { message: 'Produtos cadastrados.' }).status(201)
    } catch (error) {
        res.sendStatus(400)
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

        res.send( { data: result, message: 'Produto atualizado.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}
export const deleteProductController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const id_product = req.params.id
        const result = await deleteProdutoService(parseInt(id_product as string))
        res.send( { data: result, message: 'Produto deletado.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}

export const getTotalDataController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const result = await getTotalAmount(+tenantId)
        res.send( { data: result, message: 'Total de Produtos, Listas e Fornecedores.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}