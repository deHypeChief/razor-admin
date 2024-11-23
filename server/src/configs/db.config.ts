import mongoose from "mongoose";

export function connectDb(): void {
    console.log(`🌍 Connecting to MongoDB: ${Bun.env.MONGO_URI}`);
    
    mongoose
        .connect(Bun.env.MONGO_URI as string)
        .then(() => {
            console.log('✅ MongoDB connected successfully!');
        })
        .catch((err) => {
            console.error("❌ An error occurred while connecting to MongoDB:");
            console.error(`⚠️ Error Details: ${err.message}`);
            process.exit(1);
        });
}
