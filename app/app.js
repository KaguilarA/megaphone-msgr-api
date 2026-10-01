import express from "express";
import { OwlCors, OwlMongoClose } from "owl-expressjs-utils";

export default function (allowUrls, port) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(OwlCors(allowUrls));
  app.use("/webhooks/whatsapp", express.raw({ type: "application/json", limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  const server = app.listen(port, () => {
    console.log(
      `⚡️ Servidor ejecutándose en http://localhost:${port} [PID: ${process.pid}]`,
    );
  });

  async function shutdown(signal) {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);

    server.close(async () => {
      try {
        await OwlMongoClose();
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

  return app;
};