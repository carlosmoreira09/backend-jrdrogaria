import {productsRepository} from "../repository/productsRepository";
import {Products} from "../entity/Products";


export const findProductById = async (id: number) => {
    return await productsRepository.findOne({ where: {
            id: id
        },
    })
}

export const listProductsService = async () => {
    return await productsRepository.find({
        order: {
            product_name: 'ASC'
        }
    })
}

export const createProductService = async(product: Products) => {

    const checkProduct = await productsRepository.findOne( {
        where: {
            product_name: product.product_name
        },
        })
    if(checkProduct) {
        return { message:  'Produto já adicionado '}
    }
    const newProduct = productsRepository.create(product)
    await productsRepository.save(newProduct)
    return { message: 'Produto adicionado'}
}

export const updateProductService = async (product: Products) => {
    const updateProduct = await productsRepository.update({id: product.id}, product)
    if(updateProduct.affected == 0) {
        throw new Error('Erro ao atualizar produto')
    }
    return { message: 'Produto atualizado '}
}

export const deleteProdutoService = async (id_product: number) => {
    return await productsRepository.delete({id: id_product})
}
export const countProductService = async () => {
    return await productsRepository.count()

}