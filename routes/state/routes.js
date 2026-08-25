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
  const controller = OwlController(data);

  router.use(OwlIsAuth);
  router.get(
    "/",
    requirePermission("state:getList", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "state:getList",
    }),
    controller.getAll.bind(controller),
  );
  router.post(
    "/",
    requirePermission("state:register", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "state:register",
    }),
    actionLogMiddleware({
      actionLogModel: data.actionLogModel,
      action: "state:register",
    }),
    controller.register.bind(controller),
  );

  return router;
};