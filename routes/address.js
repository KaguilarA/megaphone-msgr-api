import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import AddressController from "../controllers/address.js";

export default (data) => {
  const router = Router();
  const controller = AddressController(data);

  // POST stays public, matching /email and /phoneNumber, so sign-up can attach an address before a session exists
  router.post("/", controller.register.bind(controller));
  router.use(OwlIsAuth);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};