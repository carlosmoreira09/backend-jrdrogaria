import {shoppingListRepository} from "../repository/shoppingListRepository";
import {ProductData} from "../entity/ShoppingList";


export const listShoppingListService = async (id_store: number) => {

    try {
      return await shoppingListRepository.find({
            where: {
                tenants: {
                    id: id_store
                }
            },
        })
    }  catch (error) {
        throw new Error('Erro ao listar listas de comprar')
    }
}
export const updateShoopingListService = async (list: { id: number, list_name: string, products: ProductData[] }, tenantID: number) => {
    const findList = await getShoppingListDetailService(list?.id, tenantID)
        if(findList) {
            delete findList.products
            findList.products = list.products
            return await shoppingListRepository.save(findList)
        } else {
            throw new Error('Erro ao atualizar lista')
        }
}

export const createShoppingListService = async (newList: { list_name: string, products: ProductData[] } , id_store: number) => {

   try {

           const listShopping = shoppingListRepository.create({...newList, tenants: {
               id: id_store
               }})

          const result =  await shoppingListRepository.save(listShopping)

           return { data: result, message: 'Lista criada' }

   } catch (error) {
       throw  new Error('Erro ao criar lista')
   }
}

export const deleteShoppingListService = async (id_list: number) => {
    return await shoppingListRepository.delete({id: id_list})

}
export const getShoppingListDetailService = async(id_list: number, id_store: number) => {
    return await shoppingListRepository.findOne({
        where: {
            id: id_list,
            tenants: {
                id: id_store
            }
        }
    })
}

export const countShoppingListService = async (id_store: number) => {
    return await shoppingListRepository.count({ where: { tenants: { id: id_store}}, relations: ['tenants']})
}