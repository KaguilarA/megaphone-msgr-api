import { Router } from "express";
import multer from "multer";
import { OwlIsAuth } from "owl-expressjs-utils";
import ContactController from "../../controllers/contact/controller.js";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";

const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;
const IMPORT_EXTENSIONS = new Set(["csv", "json", "xlsx"]);
const importFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMPORT_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.split(".").pop()?.toLowerCase();
    if (IMPORT_EXTENSIONS.has(extension)) return callback(null, true);
    return callback(Object.assign(new Error("Solo se permiten archivos CSV, JSON o Excel .xlsx."), { status: 400 }));
  },
});

/**
 * Create the authenticated contact router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    getAll,
    getById,
    importContacts,
    register,
    updateById,
    deleteById
  } = ContactController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.post),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.post(
    "/import",
    routePermission(data, data.actions.post),
    ActionLogMiddleware(auditDependencies, data.actions.post),
    (req, res, next) => importFile.single("file")(req, res, (error) => {
      if (error) {
        return res.status(error.status || (error.code === "LIMIT_FILE_SIZE" ? 413 : 400))
          .json({ error: error.code === "LIMIT_FILE_SIZE" ? "El archivo no puede superar 5 MB." : error.message });
      }
      return next();
    }),
    importContacts,
  );
  router.get("/", routePermission(data, data.actions.getAll), getAll);
  router.get("/:id", routePermission(data, data.actions.getById), getById);
  router.put(
    "/:id",
    routePermission(data, data.actions.update),
    ActionLogMiddleware(auditDependencies, data.actions.update),
    updateById,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete),
    ActionLogMiddleware(auditDependencies, data.actions.delete),
    deleteById,
  );

  return router;
};
