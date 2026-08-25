import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import PhoneNumberController from "../../controllers/phone/controller.js";
import createActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the phone-number router with its public registration and authenticated routes.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = PhoneNumberController(data);

  router.use(OwlIsAuth);
  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.post("/", createActionLogMiddleware(auditDependencies, "phone:addUserPhoneNumber"), controller.registerUserPhoneNumber.bind(controller));
  router.post("/:id/contact", createActionLogMiddleware(auditDependencies, "phone:addContactPhoneNumber"), controller.registerContactPhoneNumber.bind(controller));
  router.get("/", controller.getUserPhoneNumber.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.get("/:id/contact", controller.getContactPhoneNumber.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "phone:edit"), controller.update.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "phone:delete"), controller.delete.bind(controller));


  return router;
};
