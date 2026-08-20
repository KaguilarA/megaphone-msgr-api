import { Router } from "express";
import authController from "../../controllers/auth/controller.js";

export default (data) => {
  const router = Router();
  const controller = authController(data);

  router.post("/login", controller.logIn.bind(controller));
  router.post("/logout", controller.logout.bind(controller));
  router.get("/status", controller.status.bind(controller));

  return router;
};
