import { Router } from "express";
import CountriesController from "../../controllers/countries/controller.js";

/**
 * Create the public countries router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { getAll } = CountriesController(data);

  router.get("/", getAll);

  return router;
}