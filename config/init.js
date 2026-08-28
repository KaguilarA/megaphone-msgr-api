import { OwlSession } from "owl-expressjs-utils";

export default function (
  app,
  ApiConfig,
  sessionSecret,
  nodeEnv,
  dbName,
  dbHost,
) {
  app.use(OwlSession(sessionSecret, nodeEnv, dbName, dbHost));

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    app.use(url, childRouter(config)),
  );
}
