import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import { actionLogMiddleware, requirePermission } from "../../middlewares/permissionMiddleware.js";

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
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "read_permission",
    }),
    controller.getAll.bind(controller),
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
    controller.register.bind(controller),
  );

  router.get(
    "/:id",
    requirePermission("read_permission", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "read_permission",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "read_permission",
    }),
    controller.getById.bind(controller),
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
    controller.update.bind(controller),
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
    controller.delete.bind(controller),
  );

  return router;
};
