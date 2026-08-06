import { Router } from "express";
import ApiConfig from "./index.js";

export default () => {
  const router = Router();

  ApiConfig.forEach(({ url, config, controller }) =>
    router.use(url, controller(config)),
  );

  return router;
};
