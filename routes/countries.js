import { Router } from "express";
import countriesController from "../controllers/countries/countries.js";

export default (data) => {
  const router = Router();
  const controller = countriesController(data);

  router.get("/", controller.getAll.bind(controller));

  return router;
}