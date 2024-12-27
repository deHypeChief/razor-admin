import mongoose from "mongoose";

interface IAdmin {
    sessionClientId: mongoose.Types.ObjectId;
    fullName: string;
    accesslevel: string;
}