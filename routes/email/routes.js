import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import EmailController from "../../controllers/email/controller.js";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the email router with its public registration and authenticated routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = EmailController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post("/", createActionLogMiddleware(auditDependencies, "email:addUserEmail"), controller.registerUserEmail.bind(controller));
  router.post("/:id/contact", createActionLogMiddleware(auditDependencies, "email:addContactEmail"), controller.registerContactEmail.bind(controller));
  router.get("/", controller.getUserEmail.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.get("/:id/contact", controller.getContactEmail.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "email:edit"), controller.update.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "email:delete"), controller.delete.bind(controller));

  return router;
};
