import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import PhoneNumberController from "../../controllers/phone/controller.js";

export default (data) => {
  const router = Router();
  const controller = PhoneNumberController(data);

  router.post("/", controller.registerUserPhoneNumber.bind(controller));
  router.use(OwlIsAuth);
  router.post("/contact", controller.registerContactPhoneNumber.bind(controller));
  router.get("/", controller.getUserPhoneNumber.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.get("/:id/contact", controller.getContactPhoneNumber.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));


  return router;
};
