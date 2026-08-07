import { Router } from "express";
import UserController from "../controllers/user.js";
import isAuth from "../middlewares/isAuth.js";

export default (data) => {
  const router = Router();
  const controller = UserController(data);

  router.post("/", controller.register.bind(controller));
  router.use(isAuth);
  router.get("/", controller.getInfo.bind(controller));
  router.put("/", controller.update.bind(controller));

  return router;
};
