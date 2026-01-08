import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwtHelper';
import { usersRepository } from "../repository/usersRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.sendStatus(401);
        return;
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verifyToken(token);
        const { userId } = decoded;

        const user = await usersRepository.findOne({ 
            where: { id: userId },
            relations: ['tenant']
        });
        
        if (!user) {
            res.sendStatus(401);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.sendStatus(401);
    }
};