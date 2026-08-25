import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";

/**
 * Create the authenticated state router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.post("/", controller.register.bind(controller));

  return router;
};