import { Router } from "express";

import viewController from "./user.controller.js";

export default (model) => {
  const router = Router();
  const controller = viewController(model);

  router.get("/new", controller.renderRegister.bind(controller));

  return router;
};
