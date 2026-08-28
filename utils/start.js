import { OwlMongoConnect } from "owl-expressjs-utils";
import InitRoutes from "../config/init.js";

export default async function (
  app,
  ApiConfig,
  dbHost,
  sessionSecret,
  nodeEnv,
  dbName,
) {
  try {
    await OwlMongoConnect(dbHost);
    await InitRoutes(app, ApiConfig, sessionSecret, nodeEnv, dbName, dbHost);
  } catch (err) {
    console.error(
      `❌ Error al iniciar el servidor [PID: ${process.pid}]:`,
      err,
    );
    process.exit(1);
  }
}
