import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";

/**
 * Create the authenticated user-token CRUD router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.post),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    controller.register,
  );
  router.get(
    "/:id",
    routePermission(data, data.actions.getById),
    controller.getById,
  );
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    controller.update,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    controller.delete,
  );

  return router;
};
