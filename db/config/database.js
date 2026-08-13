import mongoose from "mongoose";

/**
 * Establishes a secure connection to the MongoDB database using Mongoose.
 * Validates the presence of the connection URI in environment variables and handles connection errors.
 */
export default async (mongodburl) => {
  if (!mongodburl) {
    throw new Error("DB_HOST is not defined");
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(mongodburl, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 2000,
      retryWrites: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};