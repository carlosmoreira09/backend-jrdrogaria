import {shoppingListRepository} from "../repository/shoppingListRepository";
import {ProductData} from "../entity/ShoppingList";

/**
 * List all shopping lists for a given store
 * @param id_store Store ID
 * @returns Shopping lists
 */
export const listShoppingListService = async (id_store: number) => {

    try {
      return await shoppingListRepository.find({
            where: {
                tenants: {
                    id: id_store
                },
            },
          order: {
                created_at: 'DESC'
          }
        })
    }  catch (error) {
        throw new Error('Erro ao listar listas de comprar')
    }
}

/**
 * Update a shopping list
 * @param list Shopping list data
 * @param tenantID Tenant ID
 * @returns Updated shopping list
 */
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

/**
 * Create a new shopping list
 * @param newList New shopping list data
 * @param id_store Store ID
 * @returns Created shopping list
 */
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

/**
 * Delete a shopping list
 * @param id_list Shopping list ID
 * @returns Deleted shopping list
 */
export const deleteShoppingListService = async (id_list: number) => {
    return await shoppingListRepository.delete({id: id_list})

}

/**
 * Get shopping list details
 * @param id_list Shopping list ID
 * @param id_store Store ID
 * @returns Shopping list details
 */
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

/**
 * Count shopping lists for a given store
 * @param id_store Store ID
 * @returns Shopping list count
 */
export const countShoppingListService = async (id_store: number) => {
    return await shoppingListRepository.count({ where: { tenants: { id: id_store}}, relations: ['tenants']})
}