import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import MessageController from "../../controllers/message/controller.js";
import { createActionLogMiddleware } from "../../middlewares/permissionMiddleware.js";

/**
 * Create the authenticated message router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = MessageController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post("/", createActionLogMiddleware(auditDependencies, "message:create"), controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "message:edit"), controller.update.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "message:delete"), controller.delete.bind(controller));

  return router;
};
