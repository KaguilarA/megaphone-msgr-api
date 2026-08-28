import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import EmailController from "../../controllers/email/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

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
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    actionLogMiddleware(auditDependencies, "email:addUserEmail"),
    registerForUser,
  );
  router.post(
    "/:id/contact",
    actionLogMiddleware(auditDependencies, "email:addContactEmail"),
    registerForContact,
  );
  router.get("/", getDataForUser);
  router.get("/:id", getDataById);
  router.get("/:id/contact", getDataForContact);
  router.put(
    "/:id",
    actionLogMiddleware(auditDependencies, "email:edit"),
    updateDataById,
  );
  router.delete(
    "/:id",
    actionLogMiddleware(auditDependencies, "email:delete"),
    deleteDataById,
  );

  return router;
};
