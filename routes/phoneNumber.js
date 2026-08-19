import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import PhoneNumberController from "../controllers/phoneNumber.js";

export default (data) => {
  const router = Router();
  const controller = PhoneNumberController(data);

  router.post("/", controller.register.bind(controller));
  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
