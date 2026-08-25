import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ContactController from "../../controllers/contact/controller.js";

/**
 * Create the authenticated contact router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = ContactController(data);

  router.use(OwlIsAuth);
  router.post("/", controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
