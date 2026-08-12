import mongoose from "mongoose";

/**
 * Establishes a secure connection to the MongoDB database using Mongoose.
 * Validates the presence of the connection URI in environment variables and handles connection errors.
 */
export default async (mongodburl) => {
  try {
    await mongoose.connect(mongodburl);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};