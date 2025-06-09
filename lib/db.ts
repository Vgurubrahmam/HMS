import mongoose from "mongoose"
import User from "./models/User"; // Ensure User model is registered

const db= async()=>{
    try{
        const mongoUri = process.env.MONGODB_URI;
        console.log(mongoUri);
        
        if (!mongoUri) {
            throw new Error("MONGODB_URI environment variable is not defined");
        }
        await mongoose.connect(mongoUri, {
            dbName: "hackathonmanagementsystem"
        });

        // Register models to avoid MissingSchemaError
        User;

        console.log("mongodb connected")
        const connectionState = mongoose.connection.readyState;
        if (connectionState === 1) {
            console.log("MongoDB is connected");
        } else {
            console.log("MongoDB is not connected");
        }
    }catch(error){
        console.error('MongoDB connection failed:', error);
        throw error
    }
}
export default db