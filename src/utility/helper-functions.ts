
import { v4 as uuidv4 } from 'uuid';
import { Environment } from '../environment';
import moment from 'moment';
import jwt from 'jsonwebtoken'

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
}