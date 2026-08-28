import createApp from "../app/app.js";
import {
  FrontendUrl,
  Port,
  DbHost,
  SessionSecret,
  NodeEnv,
  DbName,
} from "../consts/index.js";
import ApiConfig from "../consts/config.js";
import start from "./start.js";

/**
 * Create and initialize the application.
 * @returns {Promise<void>} A promise that resolves when the application is initialized.
 */
export default async function() {
  const app = createApp([FrontendUrl], Port);

  try {
    await start(app, ApiConfig, DbHost, SessionSecret, NodeEnv, DbName);
  } catch (err) {
    console.error(
      `❌ Error al iniciar el servidor [PID: ${process.pid}]:`,
      err,
    );
    process.exit(1);
  }
}