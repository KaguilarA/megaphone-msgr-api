import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import EmailController from "../../controllers/email/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";

/**
 * Create the email router with its public registration and authenticated routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    getDataById,
    getDataForContact,
    getDataForUser,
    registerForContact,
    registerForUser,
    updateDataById,
    deleteDataById,
  } = EmailController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.postUser),
    actionLogMiddleware(auditDependencies, data.actions.postUser),
    registerForUser,
  );
  router.post(
    "/:id/contact",
    routePermission(data, data.actions.postContact),
    actionLogMiddleware(auditDependencies, data.actions.postContact),
    registerForContact,
  );
  router.get("/", routePermission(data, data.actions.getUser), getDataForUser);
  router.get("/:id", routePermission(data, data.actions.getById), getDataById);
  router.get(
    "/:id/contact",
    routePermission(data, data.actions.getContact),
    getDataForContact,
  );
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    actionLogMiddleware(auditDependencies, data.actions.update),
    updateDataById,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    actionLogMiddleware(auditDependencies, data.actions.delete),
    deleteDataById,
  );

  return router;
};
