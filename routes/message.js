import { Router } from "express";
import MessageController from "../controllers/message.js";
import isAuth from "../middlewares/isAuth.js";

export default (data) => {
  const router = Router();
  const controller = MessageController(data);

  router.use(isAuth);
  router.post("/send", controller.send.bind(controller));
  router.post("/", controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
