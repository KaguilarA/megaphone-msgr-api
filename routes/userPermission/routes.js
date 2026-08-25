import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import { actionLogMiddleware, requirePermission } from "../../middlewares/permissionMiddleware.js";

/**
 * Create the user-permission router with authorization and audit middleware.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);

  router.get(
    "/",
    requirePermission("read_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_user_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "read_user_permission",
    }),
    controller.getAll.bind(controller),
  );

  router.post(
    "/",
    requirePermission("create_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "create_user_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "create_user_permission",
    }),
    controller.register.bind(controller),
  );

  router.get(
    "/:id",
    requirePermission("read_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_user_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "read_user_permission",
    }),
    controller.getById.bind(controller),
  );

  router.put(
    "/:id",
    requirePermission("update_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "update_user_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "update_user_permission",
    }),
    controller.update.bind(controller),
  );

  router.delete(
    "/:id",
    requirePermission("delete_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "delete_user_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "delete_user_permission",
    }),
    controller.delete.bind(controller),
  );

  return router;
};
