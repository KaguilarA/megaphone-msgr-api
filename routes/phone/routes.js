import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import PhoneController from "../../controllers/phone/controller.js";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the phone-number router with its public registration and authenticated routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { 
    registerForUser,
    registerForContact,
    getDataFromUser,
    getDataById,
    getDataFromContact,
    updateDataById,
    deleteDataById,
  } = PhoneController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    ActionLogMiddleware(auditDependencies, "phone:addUserPhoneNumber"),
    registerForUser,
  );
  router.post(
    "/:id/contact",
    ActionLogMiddleware(auditDependencies, "phone:addContactPhoneNumber"),
    registerForContact,
  );
  router.get("/", getDataFromUser);
  router.get("/:id", getDataById);
  router.get("/:id/contact", getDataFromContact);
  router.put(
    "/:id",
    ActionLogMiddleware(auditDependencies, "phone:edit"),
    updateDataById,
  );
  router.delete(
    "/:id",
    ActionLogMiddleware(auditDependencies, "phone:delete"),
    deleteDataById,
  );

  return router;
};
