import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import EmailController from "../../controllers/email/controller.js";

/**
 * Create the email router with its public registration and authenticated routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = EmailController(data);

  router.post("/", controller.registerUserEmail.bind(controller));
  router.use(OwlIsAuth);
  router.post("/contact", controller.registerContactEmail.bind(controller));
  router.get("/", controller.getUserEmail.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.get("/:id/contact", controller.getContactEmail.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
