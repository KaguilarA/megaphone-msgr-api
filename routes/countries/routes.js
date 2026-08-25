import { Router } from "express";
import countriesController from "../../controllers/countries/controller.js";

/**
 * Create the public countries router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = countriesController(data);

  router.get("/", controller.getAll.bind(controller));

  return router;
}