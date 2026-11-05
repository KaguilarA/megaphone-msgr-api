import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import UserTokenController from "../../controllers/userTokens/controller.js";

/**
 * Create the authenticated user-token CRUD router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const userTokenController = UserTokenController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.get(
    "/phone/:phoneId",
    routePermission(data, data.actions.getById),
    userTokenController.getForPhone,
  );
  router.post(
    "/phone/:phoneId/telegram",
    routePermission(data, data.actions.post),
    userTokenController.saveTelegram,
  );
  router.post(
    "/",
    routePermission(data, data.actions.post),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    userTokenController.saveWhatsApp,
  );
  router.get(
    "/:id",
    routePermission(data, data.actions.getById),
    userTokenController.getById,
  );
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    userTokenController.update,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    userTokenController.delete,
  );

  return router;
};
