import { Router } from "express";
import ApiConfig from "./index.js";

export default () => {
  const router = Router();

  ApiConfig.forEach(({ url, config, router: childRouter }) =>
    router.use(url, childRouter(config)),
  );

  return router;
};
