import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import EmailController from "../controllers/email.js";

export default (data) => {
  const router = Router();
  const controller = EmailController(data);

  router.post("/", controller.register.bind(controller));
  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
