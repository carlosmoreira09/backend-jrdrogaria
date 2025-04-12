import {NextFunction, Request, Response} from 'express';
import {verifyToken} from '../utils/jwtHelper';
import {usersRepository} from "../repository/usersRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
         res.sendStatus(401);
    } else {

        const [, token] = authHeader.split(' ');

        try {
            const decoded = verifyToken(token);
            req.user = decoded;

            const {userId, role} = decoded;

            let validSession = false;
            const patient = await usersRepository.findOne({where: {id: userId}});
            if (patient) {
                validSession = true;
            }

            if (!validSession) {
                res.sendStatus(401);
            }

            next();
        } catch (error) {
            res.sendStatus(401);
        }
    }
};