import { Router } from "express";
import { OwlController } from "owl-expressjs-utils";
import isAuth from "../middlewares/isAuth.js";

export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.post("/", controller.register.bind(controller));
  router.use(isAuth);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
