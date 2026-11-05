import { OwlMongoConnect } from "owl-expressjs-utils";
import InitRoutes from "./initApiRoutes.js";

/**
 * Start the server by connecting to the database and initializing API routes.
 * @param {import('express').Application} app The Express application instance.
 * @param {Array<{url: string, config: Object, router: Function}>} ApiConfig Configuration for the API routes.
 * @param {string} dbHost Hostname of the database (e.g., "localhost:27017").
 * @param {string} sessionSecret Connection secret for the session.
 * @param {string} nodeEnv Node environment (e.g., "development" or "production").
 * @param {string} dbName Name of the database.
 */
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
