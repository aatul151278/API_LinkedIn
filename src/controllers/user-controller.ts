import * as express from 'express';
import { Router, Request, Response } from "express";
import mongoose, { HydratedDocument } from 'mongoose';
import { basicUserInfo, UserSchema } from '../DBSchema/users';
import { Environment } from "../environment";
import { UserStatus } from '../utility/types';
import { getSystemSetting } from './setting-controller';

const UserModel = mongoose.model('users', UserSchema);

export class UserController {
    public router: Router;

    constructor(private env: Environment) {
        this.router = express.Router();
        this.APIRouters();
    }

    private APIRouters = () => {
        this.router.post("/auth", async (request, response) => this.loginAdmin(request, response));
        this.router.get("/validate/:token", async (request, response) => this.verifyToken(request, response));
        this.router.post("/list", async (request, response) => this.getAllUser(request, response));
        this.router.get("/detail/:id", async (request, response) => this.getUserById(request, response));
        this.router.post("/save", async (request, response) => this.saveUser(request, response));
        this.router.post("/updateStatus", async (request, response) => this.updateUserStatus(request, response));
    }

    private loginAdmin = async (request: Request, response: Response) => {
        try {
            const objBody = request.body;
            if (!!!objBody.email || !!!objBody.pwd)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resExistAdmin = await UserModel.findOne({ email: objBody.email, pwd: objBody.pwd });
            if (resExistAdmin) {
                if (resExistAdmin.status !== "Active") { return response.status(200).send({ success: false, message: "User Not Active, Please contact administrator.", data: null }); }
                resExistAdmin.loginDate = new Date();
                let resUpdate = basicUserInfo(await resExistAdmin.save().catch((err) => { throw err }));
                resUpdate.token = this.env.helperFunction.getToken({
                    email: resUpdate.email,
                    uid: resUpdate.uid,
                    _id: resUpdate._id
                });
                return response.status(200).send({ success: true, message: "User Login Successfully", data: resUpdate });
            } else {
                return response.status(200).send({ success: false, message: "Invalid Email or Password", data: null });
            }
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private verifyToken = async (request: Request, response: Response) => {
        try {
            const objParams = request.params;
            if (!!!objParams.token)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resTokenData: any = this.env.helperFunction.validateToken(objParams.token);
            if (resTokenData && resTokenData._id) {
                const resExistUser = await UserModel.findById(resTokenData._id);
                if (resExistUser) {
                    if (resExistUser.status !== "Active") { return response.status(200).send({ success: false, message: "User Not Active, Please contact administrator.", data: null }); }
                    return response.status(200).send({ success: true, message: "User detail found", data: resExistUser });
                } else {
                    return response.status(200).send({ success: false, message: "No user found", data: null });
                }
            }
            return response.status(200).send({ success: false, message: "Invalid Token", data: null });

        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private getAllUser = async (request: Request, response: Response) => {
        try {
            const objBody = request.body;
            const Page = objBody.page || 1;
            const Limit = objBody.limit || 10;
            const Skip = (Page - 1) * Limit;

            const filter = { email: { $ne: process.env.ADMIN_EMAIL } };
            const resUserCount = await UserModel.count(filter);


            let rows = await UserModel.find(filter, {}, { skip: Skip, limit: Limit }).sort({ signupDate: -1 });
            const resUser = {
                pagination: {
                    totalRecords: resUserCount,
                    page: Page,
                    limit: Limit
                },
                rows: rows
            }
            return response.status(200).send({ success: true, message: "Users found.", data: resUser });

        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private getUserById = async (request: Request, response: Response) => {
        try {
            const objParams = request.params;
            if (!!!objParams.id)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resExistUser = await UserModel.findById(objParams.id);
            if (resExistUser) {
                return response.status(200).send({ success: true, message: "User detail found", data: resExistUser });
            } else {
                return response.status(200).send({ success: false, message: "No user found", data: null });
            }
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private saveUser = async (request: Request, response: Response) => {
        try {
            const objBody = request.body;
            if (!!!objBody.uid || !!!objBody.email)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resExistUser = await UserModel.findOne({ email: objBody.email });
            let resUser: any = null;
            if (resExistUser) {
                resExistUser.name = objBody.name;
                resExistUser.picture = objBody.picture;
                resExistUser.loginDate = new Date();
                resUser = basicUserInfo(await resExistUser.save().catch((err) => { throw err }));
            } else {
                const resSetting = await getSystemSetting();
                const defaultCredit = resSetting.success ? resSetting.defaultcredit : 5;

                const instance = new UserModel();
                instance.uid = objBody.uid;
                instance.email = objBody.email;
                instance.pwd = objBody.pwd || this.env.helperFunction.generateUUID();
                instance.name = objBody.name;
                instance.picture = objBody.picture;
                instance.signupDate = new Date();
                instance.loginDate = new Date();
                instance.status = UserStatus.Active;
                instance.credit = defaultCredit;
                resUser = basicUserInfo(await instance.save().catch((err) => { throw err }));
            }
            resUser.token = this.env.helperFunction.getToken({
                email: resUser.email,
                uid: resUser.uid,
                _id: resUser._id
            });
            return response.status(200).send({ success: true, message: "User save successfully", data: resUser });

        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private updateUserStatus = async (request: Request, response: Response) => {
        try {
            const objBody = request.body;
            console.log(objBody)
            if (!!!objBody.id || !!!objBody.status)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resExistUser = await UserModel.findById(objBody.id);
            if (resExistUser) {
                resExistUser.status = objBody.status;
                const resUpdate = await resExistUser.save().catch((err) => { throw err });
                return response.status(200).send({ success: true, message: `User ${objBody.status} successfully`, data: resUpdate });
            } else {
                return response.status(200).send({ success: false, message: "No user found", data: null });
            }
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

}