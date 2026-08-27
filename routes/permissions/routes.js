import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import actionLogMiddleware from "./../../middlewares/actionLog/actionLog.js";
import requirePermission from "../../middlewares/permission/permission.js";

/**
 * Create the permission router with authorization and audit middleware.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);

  router.get(
    "/",
    requirePermission("read_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_permission",
    }),
    controller.getAll,
  );

  router.post(
    "/",
    requirePermission("create_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "create_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "create_permission",
    }),
    controller.register,
  );

  router.get(
    "/:id",
    requirePermission("read_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_permission",
    }),
    controller.getById,
  );

  router.put(
    "/:id",
    requirePermission("update_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "update_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "update_permission",
    }),
    controller.update,
  );

  router.delete(
    "/:id",
    requirePermission("delete_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "delete_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "delete_permission",
    }),
    controller.delete,
  );

  return router;
};
