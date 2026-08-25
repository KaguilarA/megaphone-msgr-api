import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import UserController from "../../controllers/user/controller.js";

/**
 * Create the user router with public registration and authenticated account routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = UserController(data);

  router.post("/", controller.register.bind(controller));
  router.use(OwlIsAuth);
  router.get("/", controller.getInfo.bind(controller));
  router.put("/", controller.update.bind(controller));

  return router;
};
