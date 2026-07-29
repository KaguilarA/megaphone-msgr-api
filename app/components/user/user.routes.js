import { Router } from "express";

import viewController from "./user.controller.js";

export default (model) => {
  const router = Router();
  const controller = viewController(model);

  router.get("/", controller.renderHome.bind(controller));
  router.get("/new", controller.renderRegister.bind(controller));
  router.get("/:id/edit", controller.renderEdit.bind(controller));

  return router;
};
