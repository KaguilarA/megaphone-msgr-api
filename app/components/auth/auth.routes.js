import { Router } from "express";
import viewController from "./auth.controller.js";

export default () => {
  const router = Router();
  const controller = viewController();

  router.get("/", controller.renderHome.bind(controller));
  router.get("/register", controller.renderRegister.bind(controller));
  router.get("/logout", controller.logout.bind(controller));

  return router;
}