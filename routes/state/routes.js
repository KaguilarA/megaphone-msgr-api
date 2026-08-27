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
  const {
    getAll,
    register,
  } = OwlController(data);

  router.use(OwlIsAuth);
  router.get(
    "/",
    requirePermission("state:getList", {
      permissionModel: data.permissionModel,
      userPermissionModel: data.userPermissionModel,
      action: "state:getList",
    }),
    getAll,
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
    register,
  );

  return router;
};