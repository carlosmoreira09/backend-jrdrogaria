import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {TokenPayload} from "../schemas/tokenPayload";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (userId: number, role: string, tenantId?: number, tenantSlug?: string, tenantName?: string): string => {
    const payload: TokenPayload = { userId, tenantId: tenantId!, tenantSlug, tenantName, role };
    
    const expiresIn = role === 'admin' || role === 'tenant_owner' ? '7d' : '3d';

    return jwt.sign(payload, JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET!) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
