import path from "node:path";
import express from "express";
import connectDB from "./db/config/database.js";
import ModelsList from "./db/models.list.js";
import corsMiddleware from "./config/cors.js";

import apiRouter from "./api/api.js";
import appRouter from "./app/app.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.set("view engine", "pug");
app.set("views", path.join(process.cwd(), "app/views"));
app.use(
  "/js/vendor/alpine",
  express.static(path.join(process.cwd(), "node_modules/alpinejs/dist")),
);
app.use(
  "/js/vendor/reactive-values",
  express.static(path.join(process.cwd(), "node_modules/reactive-values/dist")),
);
app.use(express.static(path.join(process.cwd(), "public")));

app.use("", appRouter(ModelsList.app));
app.use("/api", apiRouter(ModelsList.api));

app.listen(PORT, () => {
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});