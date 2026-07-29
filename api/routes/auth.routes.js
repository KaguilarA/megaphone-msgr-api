import { Router } from "express";
import viewController from "./../controllers/auth.controller.js";

export default (data) => {
  const router = Router();
  const controller = viewController(data);

  router.get("/", controller.logout.bind(controller));
  router.post("/", controller.logIn.bind(controller));

  return router;
};
