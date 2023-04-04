import * as express from 'express';
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Environment } from "../environment";
import { UserSchema } from '../DBSchema/users';
const UserModel = mongoose.model('users', UserSchema);

export class DashboardController {
    public router: Router;
    constructor(private env: Environment) {
        this.router = express.Router();
        this.APIRouters();
    }

    private APIRouters = () => {
        this.router.get("/userSummary", async (request, response) => this.getUserSummary(request, response));
    }

    private getUserSummary = async (request: Request, response: Response) => {
        try {
            const filter = { email: { $ne: process.env.ADMIN_EMAIL } };
            const TotalUserCount = await UserModel.count(filter);
            const ActiveUserCount = await UserModel.count({ ...filter, status: "Active" });
            const InActiveUserCount = TotalUserCount - ActiveUserCount;

            return response.status(200).send({ success: true, data: { TotalUserCount, ActiveUserCount, InActiveUserCount } });
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }


}