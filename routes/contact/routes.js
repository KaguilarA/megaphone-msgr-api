import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ContactController from "../../controllers/contact/controller.js";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated contact router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    register,
    getAll,
    getById,
    updateById,
    deleteById
  } = ContactController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    ActionLogMiddleware(auditDependencies, "contact:add"),
    register,
  );
  router.get("/", getAll);
  router.get("/:id", getById);
  router.put(
    "/:id",
    ActionLogMiddleware(auditDependencies, "contact:edit"),
    updateById,
  );
  router.delete(
    "/:id",
    ActionLogMiddleware(auditDependencies, "contact:delete"),
    deleteById,
  );

  return router;
};
