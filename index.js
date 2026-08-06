import path from "node:path";
import express from "express";
import connectDB from "./db/config/database.js";
import corsMiddleware from "./config/cors.js";
import sessionMiddleware from "./config/session.js";
import { attachActiveUser } from "./config/auth.js";
import ApiConfig from "./config.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(sessionMiddleware());
app.use(attachActiveUser);
app.use(express.json());

ApiConfig.forEach(({ url, config, router: childRouter }) =>
  app.use(url, childRouter(config)),
);

app.listen(PORT, () => {
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});