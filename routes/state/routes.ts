import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import actionLogMiddleware from "./../../middlewares/actionLog/actionLog.js";
import requirePermission from "../../middlewares/permission/permission.js";

/**
 * Create the authenticated state router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { getAll, getByCoincidence, register } = OwlController(data);

  router.use(OwlIsAuth);
  router.get(
    "/",
    requirePermission(data.actions.getAll, {
      entity: data.id || data.entityId,
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: data.actions.getAll,
    }),
    getAll,
  );
  router.post(
    "/search",
    requirePermission(data.actions.getByCoincidence, {
      entity: data.id || data.entityId,
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: data.actions.getByCoincidence,
    }),
    getByCoincidence,
  );
  router.post(
    "/",
    requirePermission(data.actions.post, {
      entity: data.id || data.entityId,
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: data.actions.post,
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      entity: data.id || data.entityId,
      action: data.actions.post,
    }),
    register,
  );

  return router;
};