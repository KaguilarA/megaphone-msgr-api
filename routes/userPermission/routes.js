import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import actionLogMiddleware from "./../../middlewares/actionLog/actionLog.js";
import requirePermission from "../../middlewares/permission/permission.js";

/**
 * Create the user-permission router with authorization and audit middleware.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);

  router.use(OwlIsAuth);

  router.get("/check/:permission", async (req, res) => {
    try {
      const permission = await data.permissionModel.getOne({
        name: req.params.permission,
      });

      if (!permission) {
        return res.json({ allowed: false });
      }

      const assignment = await data.userPermissionModel.getOne({
        user: req.session.userId,
        permission: permission._id,
      });

      return res.json({ allowed: Boolean(assignment) });
    } catch (error) {
      return res.status(500).json({
        message: "Error validando permisos.",
        error: error.message || error,
      });
    }
  });
  router.get(
    "/",
    requirePermission("read_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_user_permission",
    }),
    controller.getAll,
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
    controller.register,
  );

  router.get(
    "/:id",
    requirePermission("read_user_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_user_permission",
    }),
    controller.getById,
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
    controller.update,
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
    controller.delete,
  );

  return router;
};
