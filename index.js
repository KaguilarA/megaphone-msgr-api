import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./db/config/database.js";
import corsMiddleware from "./config/cors.js";
import sessionMiddleware from "./config/session.js";
import ApiConfig from "./config.js";

process.loadEnvFile();

const PORT = Number(process.env.PORT) || 3000;
const DB_HOST = process.env.DB_HOST;
const CLUSTER_ENABLED = process.env.CLUSTER_ENABLED === "true";
const CLUSTER_WORKERS = Number(process.env.CLUSTER_WORKERS) || 1;
const cpuCount = availableParallelism();

function getWorkerCount() {
  if (!CLUSTER_ENABLED) return 1;

  const desiredWorkers =
    Number.isInteger(CLUSTER_WORKERS) && CLUSTER_WORKERS > 0 ? CLUSTER_WORKERS : 1;

  return Math.min(desiredWorkers, Math.max(cpuCount, 1));
}

async function initRoutes(app) {
  app.use(sessionMiddleware());

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    app.use(url, childRouter(config)),
  );
}

async function startServer() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));

  try {
    await connectDB(DB_HOST);
    await initRoutes(app);

    const server = app.listen(PORT, () => {
      console.log(
        `⚡️ Servidor ejecutándose en http://localhost:${PORT} [PID: ${process.pid}]`,
      );
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);

      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log("MongoDB desconectado correctamente.");
          process.exit(0);
        } catch (err) {
          console.error("Error al cerrar MongoDB:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error(`❌ Error al iniciar el servidor [PID: ${process.pid}]:`, err);
    process.exit(1);
  }
}

if (CLUSTER_ENABLED && cluster.isPrimary) {
  const workerCount = getWorkerCount();

  console.log(`[Primary] Master PID: ${process.pid} iniciado.`);
  console.log(
    `[Primary] Desplegando ${workerCount} worker(s) en ${cpuCount} núcleo(s) disponibles...\n`,
  );

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `⚠️ [Primary] El worker ${worker.process.pid} murió (código: ${code}, señal: ${signal}). Levantando un reemplazo...`,
    );
    cluster.fork();
  });
} else {
  startServer();
}

