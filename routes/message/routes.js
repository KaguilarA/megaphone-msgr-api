import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import MessageController from "../../controllers/message/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";

/**
 * Create the authenticated message router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { register, getAll, getById, update, deleteById } =
    MessageController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    actionLogMiddleware(auditDependencies, "message:create"),
    register,
  );
  router.get("/", getAll);
  router.get("/:id", getById);
  router.put(
    "/:id",
    actionLogMiddleware(auditDependencies, "message:edit"),
    update,
  );
  router.delete(
    "/:id",
    actionLogMiddleware(auditDependencies, "message:delete"),
    deleteById,
  );

  return router;
};
