import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import MessageController from "../../controllers/message/controller.js";
import actionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import mediaUpload, {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_COUNT,
  MAX_MEDIA_FILES,
  MAX_TOTAL_MEDIA_BYTES,
  MAX_VIDEO_COUNT,
} from "../../middlewares/media/upload.js";

/**
 * Create the authenticated message router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const {
    getAll,
    getById,
    getWhatsAppChats,
    getWhatsAppChatMessages,
    register,
    delete: remove,
  } = MessageController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: data.id || data.entityId,
  };

  router.use(OwlIsAuth);
  router.post(
    "/",
    routePermission(data, data.actions.post),
    (req, res, next) => mediaUpload.array("media", MAX_MEDIA_FILES)(req, res, (error) => {
      if (error) {
        return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : error.status || 400).json({
          message: error.code === "LIMIT_FILE_SIZE"
            ? "Cada imagen no puede superar 5 MB y el video no puede superar 16 MB."
            : error.code === "LIMIT_UNEXPECTED_FILE"
              ? "Se permiten hasta 10 imágenes y un video por envío."
              : error.status ? error.message : "Solo se permiten imágenes JPEG, PNG o WebP y videos MP4 o 3GP.",
        });
      }
      const files = Array.isArray(req.files) ? req.files : [];
      const imageFiles = files.filter((file) => IMAGE_TYPES.has(file.mimetype));
      const videoFiles = files.filter((file) => !IMAGE_TYPES.has(file.mimetype));
      if (imageFiles.length > MAX_IMAGE_COUNT || videoFiles.length > MAX_VIDEO_COUNT) {
        return res.status(400).json({ message: "Se permiten hasta 10 imágenes y un video por envío." });
      }
      if (imageFiles.some((file) => file.size > MAX_IMAGE_BYTES)) {
        return res.status(413).json({ message: "Cada imagen no puede superar 5 MB." });
      }
      if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_MEDIA_BYTES) {
        return res.status(413).json({ message: "Los archivos adjuntos no pueden superar 50 MB en total." });
      }
      next();
    }),
    actionLogMiddleware(auditDependencies, data.actions.post),
    register,
  );
  router.get("/", routePermission(data, data.actions.getAll), getAll);
  router.get(
    "/whatsapp/chats",
    routePermission(data, data.actions.getAll),
    getWhatsAppChats,
  );
  router.get(
    "/whatsapp/chats/:chatId/messages",
    routePermission(data, data.actions.getAll),
    getWhatsAppChatMessages,
  );
  router.delete(
    "/:id",
    routePermission(data, data.actions.delete || data.actions.getAll),
    actionLogMiddleware(auditDependencies, data.actions.delete || data.actions.getAll),
    remove,
  );
  router.get("/:id", routePermission(data, data.actions.getById), getById);

  return router;
};
