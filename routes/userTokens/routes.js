import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated user-token CRUD router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post("/", createActionLogMiddleware(auditDependencies, "token:add"), controller.register.bind(controller));
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "token:edit"), controller.update.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "token:delete"), controller.delete.bind(controller));

  return router;
};
