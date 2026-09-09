import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ContactController from "../../controllers/contact/controller.js";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";

/**
 * Create the authenticated contact router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    getAll,
    getById,
    register,
    updateById,
    deleteById
  } = ContactController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.post),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.get("/", routePermission(data, data.actions.getAll), getAll);
  router.get("/:id", routePermission(data, data.actions.getById), getById);
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    updateById,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    deleteById,
  );

  return router;
};
