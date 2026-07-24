import { Router } from "express";
import DBController from "../utils/base.controller.js";

export default (model) => {
  const controller = new DBController("Contact", model, [
    "addresses",
    "emails",
    "phoneNumbers",
  ]);
  const router = Router();

  router.post("/", controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
