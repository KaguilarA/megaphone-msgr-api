import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import UserController from "../../controllers/user/controller.js";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import requirePermission from "../../middlewares/permission/permission.js";

/**
 * Create the user router with public registration and authenticated account routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = UserController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post(
    "/",
    requirePermission("user:register", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "user:register",
    }),
    createActionLogMiddleware(auditDependencies, "user:register"),
    controller.register.bind(controller),
  );
  router.get("/", controller.getInfo.bind(controller));
  router.get(
    "/list",
    requirePermission("user:getUserById", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "user:getUserById",
    }),
    controller.getAll.bind(controller),
  );
  router.get(
    "/:id/permissions",
    requirePermission("user:getUserPermissionsById", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "user:getUserPermissionsById",
    }),
    controller.getPermissions.bind(controller),
  );
  router.put(
    "/:id/permissions",
    requirePermission("user:updateUserPermissionsById", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "user:updateUserPermissionsById",
    }),
    createActionLogMiddleware(auditDependencies, "user:updateUserPermissionsById"),
    controller.updatePermissions.bind(controller),
  );
  router.put("/", createActionLogMiddleware(auditDependencies, "user:edit"), controller.update.bind(controller));

  return router;
};
