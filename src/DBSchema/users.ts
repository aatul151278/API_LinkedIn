
import mongoose, { ObjectId } from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export const UserSchema = new Schema({
    uid: { type: String },
    email: { type: String },
    pwd: { type: String },
    name: { type: String },
    picture: { type: String },
    credit: { type: Number },
    status: { type: String },
    signupDate: { type: Date },
    loginDate: { type: Date }
});

export const basicUserInfo = (objUser: any) => {
    return {
        _id: objUser._id,
        uid: objUser.uid,
        email: objUser.email,
        name: objUser.name,
        picture: objUser.picture,
        credit: objUser.credit,
        status: objUser.status,
        token: objUser.token || "",
    }
}