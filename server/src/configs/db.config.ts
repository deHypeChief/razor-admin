import mongoose from "mongoose";

export function connectDb():void{
    console.log(Bun.env.MONGO_URI)
    mongoose
    .connect(Bun.env.MONGO_URI as string)
    .then(()=>{
        console.log('Mongodb connected')
    })
    .catch((err)=>{
        console.error("An error occoured while connecting to mongodb")
        console.log(err);
        process.exit(1)
    })
}