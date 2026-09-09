import { parsePermissionReference } from "./permissionKey.js";

/**
 * Create middleware that validates a user-permission assignment.
 * Permission identity uses a separate entity and action name.
 * @param {string|{entity?: string, name: string}} permissionName - Permission action.
 * @param {{action?: string, actionMessage?: string, entity?: string, permissionModel?: Object, userPermissionModel?: Object}} options - Validation options.
 * @returns {import('express').RequestHandler} Permission validation middleware.
 */
export default (permissionName, options = {}) => {
  const {
    action = "access",
    actionMessage = "No tienes permisos para ejecutar esta acción.",
    entity,
    permissionModel = null,
    userPermissionModel = null,
  } = options;

  return async function permissionMiddleware(req, res, next) {
    try {
      const userId = req.session?.userId || req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado." });
      }

      const effectivePermissionModel = permissionModel || req.app?.locals?.permissionModel || null;
      const effectiveUserPermissionModel = userPermissionModel || req.app?.locals?.userPermissionModel || null;

      if (!effectivePermissionModel || !effectiveUserPermissionModel) {
        return res.status(500).json({ message: "Configuración de permisos no disponible." });
      }

      const permissionReference = parsePermissionReference(permissionName, entity);
      const permissionFilter = permissionReference.entity
        ? permissionReference
        : { name: permissionReference.name };
      const permissionDoc = await effectivePermissionModel.getOne(permissionFilter);

      if (!permissionDoc) {
        return res.status(403).json({ message: `El permiso '${permissionName}' no existe.` });
      }

      const assignment = await effectiveUserPermissionModel.getOne({
        user: userId,
        permission: permissionDoc._id,
      });

      if (!assignment) {
        return res.status(403).json({ message: actionMessage });
      }

      req.permission = permissionDoc;
      req.permissionEntity = permissionReference.entity;
      req.permissionName = permissionReference.name;
      req.permissionAction = action === "access"
        ? permissionReference.name
        : action;

      return next();
    } catch (error) {
      console.error("Error validando permisos:", error);
      return res.status(500).json({ message: "Error validando permisos." });
    }
  };
};
