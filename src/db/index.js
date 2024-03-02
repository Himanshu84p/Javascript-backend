import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(`\n Successfully Connected to DB, HOST : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MonogDB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB
