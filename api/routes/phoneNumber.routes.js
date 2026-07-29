import { Router } from "express";
import DBController from "../utils/controller.js";
import { ensureAuthenticated } from "../../config/auth.js";

export default (data) => {
  const router = Router();
  const controller = DBController(data);

  router.post("/", controller.register.bind(controller));
  router.use(ensureAuthenticated);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
