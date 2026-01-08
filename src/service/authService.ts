import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/jwtHelper';
import {ILike} from "typeorm";
import {usersRepository} from "../repository/usersRepository";
import {tenantRepository} from "../repository/tenantRepository";
import {Users} from "../entity/Users";
import {LoginAdminDTO} from "../schemas/auth/auth";

const findUserByEmail = async (email: string): Promise<Users | null> => {
    return await usersRepository.findOne({where: { email: email }, relations: ['tenant']});
};
export const getUserById = async (userId: number): Promise<Users | null> => {
    return await usersRepository.findOne({ where: { id: userId }, relations: ['tenant'] });
};

export const registerUser = async (userData: Partial<Users>, tenantId: number): Promise<{ data: Users; message: string; }> => {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const tenant = await tenantRepository.findOne({where: {id: tenantId}});
    if (!tenant) {
        throw new Error('Tenant não encontrado.');
    }

    const newUser = usersRepository.create({
        ...userData,
        password: hashedPassword,
        tenant: tenant
    });
    try {
        const result = await usersRepository.save(newUser);
        return {data: result, message: 'Usuário registrado com sucesso'};
    } catch (error) {
        throw new Error("Erro ao registrar usuário: Verifique se o email já existe.");
    }
};

export const loginUser = async (loginData: LoginAdminDTO): Promise<any>  => {
    let user: Users | null = await findUserByEmail(loginData.user)
    if (!user) {
        throw new Error('Usuário não encontrado')
    }
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
        throw new Error('Senha inválida')
    }
    const tenant = user.tenant;
    const token = generateToken(user.id, user.role, tenant.id, tenant.slug, tenant.name);
    return { token };
};


export const getUsers = async (tenantId: number) => {
    return await usersRepository.find({
        where: { tenant: { id: tenantId } },
        relations: ['tenant'],
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

