import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

process.loadEnvFile();

const SESSION_SECRET = process.env.SESSION_SECRET || "1234567890";
const NODE_ENV = process.env.NODE_ENV;
const DB_NAME = process.env.DB_NAME;

/**
 * Creates and configures an express-session middleware with MongoDB as the session store.
 * Sessions are persisted in MongoDB and automatically cleaned up after maxAge.
 *
 * @returns {Function} Express session middleware
 */
export default function () {
  const mongoStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: DB_NAME,
    collection: "sessions",
    touchAfter: 24 * 3600,
    crypto: {
      secret: SESSION_SECRET,
    },
  });

  return session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: mongoStore,
    cookie: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
}
