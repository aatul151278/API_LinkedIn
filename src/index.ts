require('dotenv').config()
import { createServer } from "http";
import { App } from "./app";

const app = new App();
const httpServer = createServer(app.express);

const initServer = async () => {
    await new Promise<void>((resolve) => {
        httpServer.listen(process.env.API_Port, () => {
            console.log(`Server started on port:${process.env.API_Port}`)
            resolve();
        });
    });
}
initServer();