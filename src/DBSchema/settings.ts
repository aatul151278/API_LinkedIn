import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export const SettingSchema = new Schema({
    defaultcredit: { type: Number },
    costperanswer: { type: Number },
    lastupdated: { type: Date },
});
