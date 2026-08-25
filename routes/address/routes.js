import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import AddressController from "../../controllers/address/controller.js";
import { createActionLogMiddleware } from "../../middlewares/permissionMiddleware.js";

/**
 * Create the authenticated address router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const controller = AddressController(data);

  router.use(OwlIsAuth);

  const auditDependencies = { actionLogModel: data.actionLogModel, permissionModel: data.permissionModel };
  router.get("/", controller.getUserAddresses.bind(controller));
  router.get("/:id", controller.getAddressById.bind(controller));
  router.get("/:id/contact", controller.getContactAddresses.bind(controller));
  router.post("/", createActionLogMiddleware(auditDependencies, "address:addUserAddress"), controller.registerUserAddress.bind(controller));
  router.post("/:id/contact", createActionLogMiddleware(auditDependencies, "address:addContactAddress"), controller.registerContactAddress.bind(controller));
  router.put("/:id", createActionLogMiddleware(auditDependencies, "address:edit"), controller.updateAddress.bind(controller));
  router.delete("/:id", createActionLogMiddleware(auditDependencies, "address:delete"), controller.deleteAddress.bind(controller));

  return router;
};