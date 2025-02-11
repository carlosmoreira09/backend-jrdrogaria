import {productsRepository} from "../repository/productsRepository";
import {Products} from "../entity/Products";
import {tenantRepository} from "../repository/tenantRepository";


export const findProductById = async (id: number, tenantId: number) => {
    return await productsRepository.findOne({ where: {
        id: id,
            tenants: {
            id: tenantId
            }
        },
        relations: ['tenants']
    })
}

export const listProductsService = async (tenantID: number) => {
    return await productsRepository.find({
    where: {
        tenants: {
            id: tenantID
        }
    },
        relations: ['tenants']
    })
}

export const createProductService = async(product: Products, tenantID: number) => {
    const tenant = await tenantRepository.findOne({ where: {
        id: tenantID
    }});
    if(!tenant) {
         throw new Error('Tenant não encontrado')
    }
    const newProduct = productsRepository.create({
        ...product,
        tenants: [tenant]
    })
    await productsRepository.save(newProduct)
    return { message: 'Produto adicionado'}
}

export const updateProductService = async (product: Products, tenantID: number) => {
    const updateProduct = await productsRepository.update({id: product.id}, product)
    if(updateProduct.affected == 0) {
        throw new Error('Erro ao atualizar produto')
    }
    return { message: 'Produto atualizado '}
}

export const deleteProdutoService = async (id_product: number) => {
    return await productsRepository.delete({id: id_product})
}