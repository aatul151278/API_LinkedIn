
import { v4 as uuidv4 } from 'uuid';
import { Environment } from '../environment';
import moment from 'moment';
import jwt from 'jsonwebtoken'
import client from 'https';
import fs from 'fs';
import path from 'path';

export class HelperFunctions {
    private JWT_TOKEN_KEY: any = process.env.JWT_TOKEN_KEY;

    constructor(private env: Environment) { }

    public generateUUID() {
        return uuidv4();
    }

    public getCurrentDateTime() {
        return moment().format("dd/MM/YYYY HH:mm")
    }

    public getToken(payload: any) {
        return jwt.sign(payload, this.JWT_TOKEN_KEY, { expiresIn: "1h", });
    }

    public validateToken(token: string) {
        try {
            return jwt.verify(token, this.JWT_TOKEN_KEY);
        } catch {
            return null;
        }
    }

    public saveAvatar(url: string, fileName: any) {
        return new Promise((resolve) => {
            try {
                const avtar = fileName + ".png";
                const filePath = path.join(__dirname, '../MediaUpload/Avatar/' + avtar);
                client.get(url, (res) => {
                    if (res.statusCode === 200) {
                        res.pipe(fs.createWriteStream(filePath))
                            .on('error', (err) => { resolve({ success: false, fileName: null }) })
                            .once('close', () => resolve({ success: true, fileName: avtar }));
                    } else {
                        res.resume();
                        resolve({ success: false, fileName: null })
                    }
                });
            } catch (err) {
                console.log("Error in Save File")
                resolve({ success: false, fileName: null })
            }
        });
    }

}