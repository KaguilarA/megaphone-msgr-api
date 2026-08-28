import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated user-token CRUD router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = OwlController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    ActionLogMiddleware(auditDependencies, "token:add"),
    controller.register,
  );
  router.get("/:id", controller.getById);
  router.put(
    "/:id",
    ActionLogMiddleware(auditDependencies, "token:edit"),
    controller.update,
  );
  router.delete(
    "/:id",
    ActionLogMiddleware(auditDependencies, "token:delete"),
    controller.delete,
  );

  return router;
};
