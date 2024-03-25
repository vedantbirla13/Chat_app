import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database connected with ${connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold)
        process.exit()
    }
}