import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import AddressController from "../../controllers/address/controller.js";

/**
 * Create the authenticated address router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { 
    getDataFromUser,
    getDataById,
    getDataFromContact,
    registerForUser,
    registerForContact,
    updateDataById,
    deleteDataById
  } = AddressController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);
  router.get("/", getDataFromUser);
  router.get("/:id", getDataById);
  router.get("/:id/contact", getDataFromContact);
  router.post(
    "/",
    ActionLogMiddleware(auditDependencies, data.actions.postUser),
    registerForUser,
  );
  router.post(
    "/:id/contact",
    ActionLogMiddleware(auditDependencies, data.actions.postContact),
    registerForContact,
  );
  router.put(
    "/:id",
    ActionLogMiddleware(auditDependencies, data.actions.update),
    updateDataById,
  );
  router.delete(
    "/:id",
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    deleteDataById,
  );

  return router;
};
