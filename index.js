import express from "express";
import connectDB from "./db/config/database.js";
import corsMiddleware from "./config/cors.js";
import sessionMiddleware from "./config/session.js";
import ApiConfig from "./config.js";

process.loadEnvFile();

const app = express();

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;

app.use(corsMiddleware);
app.use(express.json());

async function initRoutes() {
  app.use(sessionMiddleware());

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    app.use(url, childRouter(config)),
  );
}

async function startServer() {
  try {
    await connectDB(DB_HOST);
    initRoutes();

    app.listen(PORT, () => {
      console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar el servidor:", err);
    process.exit(1);
  }
}

startServer();