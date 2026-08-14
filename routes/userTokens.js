import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";

export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  router.post("/", controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
