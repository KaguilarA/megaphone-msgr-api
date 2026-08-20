import { Router } from "express";
import countriesController from "../../controllers/countries/controller.js";

export default (data) => {
  const router = Router();
  const controller = countriesController(data);

  router.get("/", controller.getAll.bind(controller));

  return router;
}