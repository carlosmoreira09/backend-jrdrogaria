import {Request, Response} from "express";
import {
    createShoppingListService,
    deleteShoppingListService, getShoppingListDetailService,
    listShoppingListService, updateShoopingListService
} from "../service/shoppinListService";
import {ProductData} from "../entity/ShoppingList";

export const listShoppingListController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const result = await listShoppingListService(tenantId)
        res.send( { data: result, message: 'Lista de Produtos.' }).status(200)
    } catch (error) {
        res.sendStatus(400)    }
}

export const createShoppingListController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const shoppingListData: { list_name: string, products: ProductData[] } = req.body;

        const result = await createShoppingListService(shoppingListData,tenantId)

        res.send( { data: result, message: 'Lista cadastrada.' }).status(201)
    } catch (error) {
        res.sendStatus(400)
    }
}
export const updateShoppingListController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }
    try {
        const shoppingListData: { list_name: string, products: ProductData[] } = req.body;
        const id = req.params.id;
        console.log(id)
        const result = await updateShoopingListService({...shoppingListData, id: Number(id)},tenantId)

        res.send( { data: result, message: 'Lista atualizada.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}

export const deleteShoppingListController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const id_list = req.params.id
        const result = await deleteShoppingListService(parseInt(id_list))
        res.send( { data: result, message: 'Lista removida.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}

export const getShoppingListDetailController = async (req: Request, res: Response) => {
    const tenantId = req.tenantId as number
    if(!tenantId) {
        throw new Error('Tenant não encontrado')
    }

    try {
        const id_list = req.params.id
        const result = await getShoppingListDetailService(parseInt(id_list), tenantId)
        res.send( { data: result, message: 'Informação da lista.' }).status(200)
    } catch (error) {
        res.sendStatus(400)
    }
}