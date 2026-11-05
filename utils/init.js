import createApp from "../app/app.js";
import {
  FrontendUrl,
  Port,
  DbHost,
  SessionSecret,
  NodeEnv,
  DbName,
} from "../consts/index.js";
import start from "./start.js";
import validateConfig from "./validateConfig.js";

/**
 * Create and initialize the application.
 * @returns {Promise<void>} A promise that resolves when the application is initialized.
 */
export default async function() {
  try {
    validateConfig();
    const app = createApp([FrontendUrl], Port);
    const { default: ApiConfig } = await import("../consts/config.js");
    await start(app, ApiConfig, DbHost, SessionSecret, NodeEnv, DbName);
  } catch (err) {
    console.error(
      `❌ Error al iniciar el servidor [PID: ${process.pid}]:`,
      err,
    );
    process.exit(1);
  }
}