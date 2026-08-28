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
  };

  router.use(OwlIsAuth);

  router.post(
    "/",
    requirePermission("user:register", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "user:register",
    }),
    ActionLogMiddleware(auditDependencies, "user:register"),
    register,
  );
  router.get("/", getInfo);
  router.get(
    "/:id",
    requirePermission("user:getUserById", {
      ...auditDependencies,
      action: "user:getUserById",
    }),
    getById,
  );
  router.get(
    "/list",
    requirePermission("user:getUserById", {
      ...auditDependencies,
      action: "user:getUserById",
    }),
    getAll,
  );
  router.get(
    "/:id/permissions",
    requirePermission("user:getUserPermissionsById", {
      ...auditDependencies,
      action: "user:getUserPermissionsById",
    }),
    getPermissions,
  );
  router.put(
    "/:id/permissions",
    requirePermission("user:updateUserPermissionsById", {
      ...auditDependencies,
      action: "user:updateUserPermissionsById",
    }),
    ActionLogMiddleware(
      auditDependencies,
      "user:updateUserPermissionsById",
    ),
    updatePermissions,
  );
  router.put(
    "/",
    ActionLogMiddleware(auditDependencies, "user:edit"),
    update,
  );

  return router;
};
