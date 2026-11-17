import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import MessageController from "../../controllers/message/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import mediaUpload, { IMAGE_TYPES, MAX_IMAGE_BYTES } from "../../middlewares/media/upload.js";

/**
 * Create the authenticated message router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { getAll, getById, register } = MessageController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.post),
    (req, res, next) => mediaUpload.single("media")(req, res, (error) => {
      if (error) {
        return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : error.status || 400).json({
          message: error.code === "LIMIT_FILE_SIZE" ? "El archivo no puede superar 16 MB." :
            error.status ? error.message : "Solo se permite un archivo de imagen o video.",
        });
      }
      if (req.file && IMAGE_TYPES.has(req.file.mimetype) && req.file.size > MAX_IMAGE_BYTES) {
        return res.status(413).json({ message: "La imagen no puede superar 5 MB." });
      }
      next();
    }),
    actionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.get("/", routePermission(data, data.actions.getAll), getAll);
  router.get("/:id", routePermission(data, data.actions.getById), getById);

  return router;
};
