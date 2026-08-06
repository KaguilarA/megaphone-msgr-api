import { Router } from "express";
import ApiConfig from "./index.js";

export default () => {
  const router = Router();

  ApiConfig.forEach(({ url, config, router }) =>
    router.use(url, router(config)),
  );

  return router;
};
