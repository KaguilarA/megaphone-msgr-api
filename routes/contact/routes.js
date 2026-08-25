import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ContactController from "../../controllers/contact/controller.js";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated contact router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = ContactController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post("/", createActionLogMiddleware(auditDependencies, "contact:add"), controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "contact:edit"), controller.update.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "contact:delete"), controller.delete.bind(controller));

  return router;
};
