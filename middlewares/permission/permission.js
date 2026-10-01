import { parsePermissionReference } from "./permissionKey.js";
import { UserPermissionModel, PermissionModel } from "./../../models/models.js";

/**
 * Create middleware that validates a user-permission assignment.
 * Permission identity uses a separate entity and action name.
 * @param {string|{entity?: string, name: string}} permissionName - Permission action.
 * @param {{action?: string, actionMessage?: string, entity?: string}} options - Validation options.
 * @returns {import('express').RequestHandler} Permission validation middleware.
 */
export default (permissionName, options = {}) => {
  const {
    action = "access",
    actionMessage = "No tienes permisos para ejecutar esta acción.",
    entity,
  } = options;

  return async function permissionMiddleware(req, res, next) {
    try {
      const userId = req.session?.userId || req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "No autenticado." });
      }

      const permissionReference = parsePermissionReference(permissionName, entity);
      const permissionFilter = permissionReference.entity
        ? permissionReference
        : { name: permissionReference.name };
      const permissionDoc = await PermissionModel.getOne(permissionFilter);

      if (!permissionDoc) {
        return res.status(403).json({ message: `El permiso '${permissionName}' no existe.` });
      }

      const assignment = await UserPermissionModel.getOne({
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
