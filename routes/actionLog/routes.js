import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated action-log CRUD router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);

  router.get("/", controller.getAll);
  router.post(
    "/",
    createActionLogMiddleware(auditDependencies, data.actions.post),
    controller.register,
  );
  router.get("/:id", controller.getById);
  router.put(
    "/:id",
    createActionLogMiddleware(auditDependencies, data.actions.update),
    controller.update,
  );
  router.delete(
    "/:id",
    createActionLogMiddleware(auditDependencies, data.actions.delete),
    controller.delete,
  );

  return router;
};
