import "reflect-metadata";
import {connectDatabase} from "./config/database";
import bodyParser from 'body-parser';
import app from "./routes";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        const cors = require('cors');

        app.use(bodyParser.json());
        app.use(cors({
            origin: '*',
            credentials: true
        }));
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