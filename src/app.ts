import express from 'express';
import { Express } from 'express';
import cors from 'cors';
import { Environment } from './environment';
import { UserController } from './controllers/user-controller';
import { SettingController } from './controllers/setting-controller';
import { DashboardController } from './controllers/dashboard-controller';

export class App {
    public express: Express;
    public env: Environment;

    constructor() {
        this.env = new Environment();

        this.express = express();
        this.express.use(cors());
        this.express.use(express.json({ limit: '200mb' }));
        const UserCtrl = new UserController(this.env);
        const SettingCtrl = new SettingController(this.env);
        const DashboardCtrl = new DashboardController(this.env);

        this.express.use("/api/v1/user", UserCtrl.router);
        this.express.use("/api/v1/setting", SettingCtrl.router);
        this.express.use("/api/v1/dashboard", DashboardCtrl.router);

        this.express.get('/', (req, res) => {
            res.send('Received a GET HTTP method');
        });
    }
}