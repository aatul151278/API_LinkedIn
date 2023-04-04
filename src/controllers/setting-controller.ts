import * as express from 'express';
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { SettingSchema } from "../DBSchema/settings";
import { Environment } from "../environment";
const SettingModel = mongoose.model('settings', SettingSchema);

export class SettingController {
    public router: Router;
    constructor(private env: Environment) {
        this.router = express.Router();
        this.APIRouters();
    }

    private APIRouters = () => {
        this.router.get("/", async (request, response) => this.getSetting(request, response));
        this.router.post("/save", async (request, response) => this.saveSetting(request, response));
    }

    private getSetting = async (request: Request, response: Response) => {
        try {
            const resExistSetting = await SettingModel.findOne().catch((err) => { throw err });
            if (resExistSetting) {
                return response.status(200).send({ success: true, message: "Settings found", data: resExistSetting });
            } else {
                return response.status(200).send({ success: false, message: "Settings not found", data: null });
            }
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }

    private saveSetting = async (request: Request, response: Response) => {
        try {
            const objBody = request.body;
            if (!!!objBody.costperanswer || !!!objBody.defaultcredit)
                return response.status(200).send({ success: false, message: "Please provide required parameter" });

            const resExistSetting = await SettingModel.findOne().catch((err) => { throw err });
            if (resExistSetting) {
                resExistSetting.costperanswer = objBody.costperanswer;
                resExistSetting.defaultcredit = objBody.defaultcredit;
                resExistSetting.lastupdated = new Date();
                const resUpdate = await resExistSetting.save().catch((err) => { throw err });
                return response.status(200).send({ success: true, message: "Settings updated successfully", data: resUpdate });
            } else {
                const instance = new SettingModel();
                instance.costperanswer = objBody.costperanswer;
                instance.defaultcredit = objBody.defaultcredit;
                instance.lastupdated = new Date();
                const resSave = await instance.save().catch((err) => { throw err });
                return response.status(200).send({ success: true, message: "Settings save successfully", data: resSave });
            }
        } catch (error: any) {
            return response.status(200).send({ success: false, message: error.message });
        }
    }
}

export const getSystemSetting = async (): Promise<any> => {
    return new Promise(async (resolve) => {
        try {
            const resExistSetting = await SettingModel.findOne().catch((err) => { throw err });
            if (resExistSetting) { return resolve({ success: true, setting: resExistSetting }) }
        } catch { }
        return resolve({ success: false, setting: null })
    })
}