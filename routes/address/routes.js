import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import AddressController from "../../controllers/address/controller.js";

/**
 * Create the authenticated address router.
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
    deleteDataById
  } = AddressController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.get("/", routePermission(data, data.actions.getUser), getDataForUser);
  router.get("/:id", routePermission(data, data.actions.getById), getDataById);
  router.get(
    "/:id/contact",
    routePermission(data, data.actions.getContact),
    getDataForContact,
  );
  router.post(
    "/",
    routePermission(data, data.actions.postUser),
    ActionLogMiddleware(auditDependencies, data.actions.postUser),
    registerForUser,
  );
  router.post(
    "/:id/contact",
    routePermission(data, data.actions.postContact),
    ActionLogMiddleware(auditDependencies, data.actions.postContact),
    registerForContact,
  );
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    updateDataById,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    deleteDataById,
  );

  return router;
};
