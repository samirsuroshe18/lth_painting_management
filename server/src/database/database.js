import mongoose from "mongoose";
import { config } from "../config/env.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(config.database.url);
        console.log(`MongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mogoDB connection Error : ", error);
        process.exit(1);
    }
}

export default connectDB;