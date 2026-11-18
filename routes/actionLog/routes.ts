import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";

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
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);

  router.get(
    "/",
    routePermission(data, data.actions.getAll),
    createActionLogMiddleware(auditDependencies, data.actions.getAll),
    controller.getAll,
  );
  router.get(
    "/:id",
    routePermission(data, data.actions.getById),
    createActionLogMiddleware(auditDependencies, data.actions.getById),
    controller.getById,
  );

  return router;
};
