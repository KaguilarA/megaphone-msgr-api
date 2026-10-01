import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import MessageController from "../../controllers/message/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import mediaUpload from "../../middlewares/media/upload.js";

/**
 * Create the authenticated message router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { getAll, getById, register } = MessageController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    mediaUpload.single("media"),
    routePermission(data, data.actions.post),
    actionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.get("/", routePermission(data, data.actions.getAll), getAll);
  router.get("/:id", routePermission(data, data.actions.getById), getById);

  return router;
};
