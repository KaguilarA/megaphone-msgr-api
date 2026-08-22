import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import UserController from "../../controllers/user/user.js";

export default (data) => {
  const router = Router();
  const controller = UserController(data);

  router.post("/", controller.register.bind(controller));
  router.use(OwlIsAuth);
  router.get("/", controller.getInfo.bind(controller));
  router.put("/", controller.update.bind(controller));

  return router;
};
