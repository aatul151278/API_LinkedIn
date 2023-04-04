import { HelperFunctions } from "./utility/helper-functions";
import mongoose from 'mongoose';


export class Environment {
    public helperFunction: HelperFunctions;

    constructor() {
        this.connectDB();
        this.helperFunction = new HelperFunctions(this);
    }

    connectDB() {
        const MongoDB_URL: string = process.env.MongoDB_URL || "";
        mongoose.connect(MongoDB_URL).then(() => console.log('DB Connected!'));
    }
}