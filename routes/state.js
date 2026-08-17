import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";

export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.post("/", controller.register.bind(controller));

  return router;
};