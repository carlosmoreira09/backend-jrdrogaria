
import {supplierRepository} from "../repository/supplierRepository";
import {Supplier} from "../entity/Supplier";

export const findProductById = async (id: number, tenantId: number) => {
    return await supplierRepository.findOne({ where: {
            id: id,
            tenant: {
                id: tenantId
            }
        },
        relations: ['tenants']
    })
}

export const listSupplierService = async (tenantId: number) => {
    return await supplierRepository.find({
        where: {
            tenant: {
                id: tenantId
            }
        }
    })
}

export const createSupplierService = async(supplier: Supplier, tenantId: number) => {

    const newSupplier = supplierRepository.create({...supplier, tenant: {
        id: tenantId
        }})
    await supplierRepository.save(newSupplier)
    return { message: 'Fornecedor adicionado'}
}

export const updateSupplierService = async (supplier: Supplier, tenantId: number) => {
    const updateProduct = await supplierRepository.update({id: supplier.id}, supplier)
    if(updateProduct.affected == 0) {
        throw new Error('Erro ao atualizar fornecedor')
    }
    return { message: 'Fornecedor atualizado '}
}

export const deleteSupplierService = async (id_supplier: number,tenantId: number) => {
    return await supplierRepository.delete({id: id_supplier,tenant: { id: tenantId }})
}

export const findSupplierById = async (id: number, tenantId: number) => {
    return await supplierRepository.findOne({ where: {
            id: id,
            tenant: {
                id: tenantId
            }
        },
    })
}

export const countSupplier = async () => {
    return await supplierRepository.count({ withDeleted: false })

}