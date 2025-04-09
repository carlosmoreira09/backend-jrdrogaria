import {NextFunction, Request, Response} from 'express';
import {verifyToken} from '../utils/jwtHelper';
import {usersRepository} from "../repository/usersRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.sendStatus(401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verifyToken(token);
        req.user = decoded;

        const { userId, role } = decoded;

        let validSession = false;
        const patient = await usersRepository.findOne({ where: { id: userId } });
        if (patient && patient.sessionToken === token) {
            validSession = true;
        }

        if (!validSession) {
            return res.sendStatus(401);        }

        next();
    } catch (error) {
        return res.sendStatus(401);    }
};