import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwtHelper';
import {ILike} from "typeorm";
import {usersRepository} from "../repository/usersRepository";
import {tenantRepository} from "../repository/tenantRepository";
import {Users} from "../entity/Users";
import {LoginAdminDTO} from "../types/enums/auth/auth";

const findAdminByEmail = async (email: string): Promise<Users | null> => {
    return await usersRepository.findOne({where: { email: email }, relations: ['tenants']});
};
export const getAdminById = async (adminID: number): Promise<Users | null> => {
    return await usersRepository.findOne({ where: { id: adminID }, relations: ['tenants'] });
};

export const registerAdmin = async (adminData: Users, tenantId: number): Promise<{ data: Users; message: string; }> => {
    const hashedPassword = await bcrypt.hash(adminData.password!, 10);
    const tenant = await tenantRepository.findOne({where: {id: tenantId}});
    if (!tenant) {
        throw new Error('Tenant não encontrado.');
    }

    const newAdmin = usersRepository.create({
        ...adminData,
        password: hashedPassword,
        tenants: tenant
    });
    try {
        const result = await usersRepository.save(newAdmin);
        return {data: result, message: 'Admin registrado com sucesso'};
    } catch (error) {
        throw new Error("Erro ao registrar admin: Verifique se o email ou CPF já existe.");
    }
};

export const loginAdmin = async (loginData: LoginAdminDTO): Promise<any>  => {
    let user: Users | null = await findAdminByEmail(loginData.user)
    if (!user) throw new Error('Usuário não encontrado');
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) throw new Error('Senha inválida');
    const tenants = user.tenants;
    console.log(tenants)
    const token = generateToken(user.id, user.role, tenants.id, tenants.name);
    console.log(token)
    user.sessionToken = token;

    return { token };
};


export const getAdmins = async (tenantId: number) => {
    return await usersRepository.find({
        where: { tenants: { id: tenantId } },
        relations: ['tenants'],
    });
};

export const getAdminByCPF = async (cpf: string) => {
    return await usersRepository.findOne({
        where: { cpf }
    });
};

export const getAdminsByName = async (name: string) => {
    return await usersRepository.find({
        where: { fullName: ILike(`%${name}%`) }
    });
};

export const updateAdmin = async (adminId: number, updateData: Users) => {
    const result = await usersRepository.update(adminId, updateData);

    if (result.affected === 0) throw new Error('Admin não encontrado');

    return { message: 'Admin atualizado com sucesso' };
}

export const deleteAdmin = async (adminId: number, tenantId: number) => {
    const admin = await usersRepository.delete({ id: adminId });

    if (!admin) {
        throw new Error('Admin não encontrado');
    }

        return { message: 'Admin desassociado do tenant com sucesso.' };
}

