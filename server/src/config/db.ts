import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log(`MongoDB connected successfully`);
    } catch (error) {
        throw new Error(`Failed to connect to MongoDB: ${error}`);
    }
}

export async function disconnectDB(): Promise<void> {
    await mongoose.disconnect();
}