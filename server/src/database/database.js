import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mogoDB connection Error : ", error);
        process.exit(1);
    }
}

export default connectDB;