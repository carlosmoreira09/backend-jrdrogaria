import {productsRepository} from "../repository/productsRepository";
import {tenantRepository} from "../repository/tenantRepository";
import {supplierRepository} from "../repository/supplierRepository";
import {Supplier} from "../entity/Supplier";

export const findProductById = async (id: number) => {
    return await supplierRepository.findOne({ where: {
            id: id
        },
        relations: ['tenants']
    })
}

export const listSupplierService = async () => {
    return await supplierRepository.find()
}

export const createSupplierService = async(supplier: Supplier) => {

    const newSupplier = supplierRepository.create(supplier)
    await supplierRepository.save(newSupplier)
    return { message: 'Fornecedor adicionado'}
}

export const updateSupplierService = async (product: Supplier) => {
    const updateProduct = await supplierRepository.update({id: product.id}, product)
    if(updateProduct.affected == 0) {
        throw new Error('Erro ao atualizar fornecedor')
    }
    return { message: 'Fornecedor atualizado '}
}

export const deleteSupplierService = async (id_supplier: number) => {
    return await supplierRepository.delete({id: id_supplier})
}

export const supplierLoginService = async (cnpj: string, email: string)=> {
    return await supplierRepository.findOne({ where: {
            cnpj: cnpj,
            email: email
        }})
}
export const findSupplierById = async (id: number) => {
    return await supplierRepository.findOne({ where: {
            id: id
        },
        relations: ['tenants']
    })
}