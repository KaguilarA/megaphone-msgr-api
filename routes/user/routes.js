import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import UserController from "../../controllers/user/controller.js";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import requirePermission from "../../middlewares/permission/permission.js";

/**
 * Create the user router with public registration and authenticated account routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    getAll,
    getById,
    getInfo,
    getPermissions,
    register,
    updatePermissions,
    update,
  } = UserController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    userPermissionModel: data.userPermissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);

  router.post(
    "/",
    requirePermission(data.actions.post, {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: data.actions.post,
    }),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.get(
    "/",
    requirePermission(data.actions.getInfo, {
      ...auditDependencies,
      action: data.actions.getInfo,
    }),
    getInfo,
  );
  // Must precede "/:id" so Express doesn't match "list" as an ObjectId.
  router.get(
    "/list",
    requirePermission(data.actions.getAll, {
      ...auditDependencies,
      action: data.actions.getAll,
    }),
    getAll,
  );
  router.get(
    "/:id",
    requirePermission(data.actions.getById, {
      ...auditDependencies,
      action: data.actions.getById,
    }),
    getById,
  );
  router.get(
    "/:id/permissions",
    requirePermission(data.actions.getPermissions, {
      ...auditDependencies,
      action: data.actions.getPermissions,
    }),
    getPermissions,
  );
  router.put(
    "/:id/permissions",
    requirePermission(data.actions.updatePermissions, {
      ...auditDependencies,
      action: data.actions.updatePermissions,
    }),
    ActionLogMiddleware(auditDependencies, data.actions.updatePermissions),
    updatePermissions,
  );
  router.put(
    "/",
    requirePermission(data.actions.update, {
      ...auditDependencies,
      action: data.actions.update,
    }),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    update,
  );

  return router;
};
