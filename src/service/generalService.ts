import {countSupplier} from "./supplierService";
import {countProductService} from "./productService";
import {countShoppingListService} from "./shoppinListService";

export const getTotalAmount = async (id_store: number) => {
    const totalSupplier = await countSupplier(id_store)
    const totalProducts = await countProductService(id_store)
    const totalShoopingList = await countShoppingListService(id_store)
    return {
        totalSupplier,
        totalProducts,
        totalShoopingList
    }
}