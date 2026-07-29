import path from "node:path";
import express from "express";
import connectDB from "./db/config/database.js";
import ModelsList from "./db/models.list.js";
import corsMiddleware from "./config/cors.js";
import sessionMiddleware from "./config/session.js";
import { attachActiveUser } from "./config/auth.js";

import apiRouter from "./api/api.js";
import appRouter from "./app/app.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(sessionMiddleware());
app.use(attachActiveUser);
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
// Serve Font Awesome from node_modules
app.use(
  "/css/vendor/fontawesome",
  express.static(path.join(process.cwd(), "node_modules", "@fortawesome", "fontawesome-free", "css")),
);
app.use(
  "/css/vendor/webfonts",
  express.static(path.join(process.cwd(), "node_modules", "@fortawesome", "fontawesome-free", "webfonts")),
);
app.use(express.static(path.join(process.cwd(), "public")));

app.use("", appRouter(ModelsList.app));
app.use("/api", apiRouter());

app.listen(PORT, () => {
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});