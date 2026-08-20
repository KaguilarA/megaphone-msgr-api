import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import AddressController from "../../controllers/address/controller.js";

export default (data) => {
  const router = Router();
  const controller = AddressController(data);

  router.use(OwlIsAuth);

  router.get("/", controller.getUserAddresses.bind(controller));
  router.get("/:id", controller.getAddressById.bind(controller));
  router.get("/:id/contact", controller.getContactAddresses.bind(controller));
  router.post("/", controller.registerUserAddress.bind(controller));
  router.post("/:id/contact", controller.registerContactAddress.bind(controller));
  router.put("/:id", controller.updateAddress.bind(controller));
  router.delete("/:id", controller.deleteAddress.bind(controller));

  return router;
};