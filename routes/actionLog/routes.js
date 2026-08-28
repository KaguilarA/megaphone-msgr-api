import { Router } from "express";
import { OwlController, OwlIsAuth } from "owl-expressjs-utils";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated action-log CRUD router.
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

  router.get(
    "/",
    createActionLogMiddleware(auditDependencies, data.actions.post),
    controller.getAll,
  );
  router.get(
    "/:id",
    createActionLogMiddleware(auditDependencies, data.actions.post),
    controller.getById,
  );


  return router;
};
