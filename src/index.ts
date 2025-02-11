import "reflect-metadata";
import {connectDatabase} from "./config/database";
import bodyParser from 'body-parser';

import app from "./routes";
import {tenantMiddleware} from "./middlewares/tenantMiddleware";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        app.use(bodyParser.json());
        await connectDatabase();
        console.log('Database Connected');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
};

startServer().then();