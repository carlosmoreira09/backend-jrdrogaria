import {shoppingListRepository} from "../repository/shoppingListRepository";
import {ShoppingList} from "../entity/ShoppingList";
import {tenantRepository} from "../repository/tenantRepository";

export const listShoppingListService = async (id_store: number) => {
    return await shoppingListRepository.find({
        where: {
            tenants: {
                id: id_store
            }
        },
        relations: ['tenants', 'products']
    })
}

export const createShoppingListService = async (newList: ShoppingList, id_store: number) => {

   try {
       const tenant = await tenantRepository.findOne({where: {id: id_store}})
       if(tenant) {
           const list: ShoppingList = {...newList, tenants: tenant}
           const listShopping = shoppingListRepository.create({...newList, tenants: tenant})
          const result =  await shoppingListRepository.save(listShopping)
           return { data: result, message: 'Lista criada' }
       }

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