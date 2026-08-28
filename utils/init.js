import createApp from "../app/app.js";
import {
  FrontendUrl,
  Port,
  DbHost,
  SessionSecret,
  NodeEnv,
  DbName,
} from "../consts/index.js";
import ApiConfig from "../consts/router.js";
import start from "./start.js";

export default async function init() {
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