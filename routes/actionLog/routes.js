import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";

/**
 * Create the authenticated action-log CRUD router. 
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.post("/", controller.register.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
