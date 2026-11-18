import { parsePermissionReference } from "./permissionKey.js";

interface PermissionMiddlewareOptions {
  action?: string;
  actionMessage?: string;
  entity?: string;
  permissionModel?: { getOne: (filter: object) => Promise<{ _id: unknown } | null> };
  userPermissionModel?: { getOne: (filter: object) => Promise<unknown> };
}

/**
 * Create middleware that validates a user-permission assignment.
 * Permission identity uses a separate entity and action name.
 * @param {string|{entity?: string, name: string}} permissionName - Permission action.
 * @param {{action?: string, actionMessage?: string, entity?: string, permissionModel?: object, userPermissionModel?: object}} options - Validation options.
 * @returns {import('express').RequestHandler} Permission validation middleware.
 */
export default (
  permissionName: string | { entity?: string; name: string },
  options: PermissionMiddlewareOptions = {},
) => {
  const {
    action = "access",
    actionMessage = "No tienes permisos para ejecutar esta acción.",
    entity,
    permissionModel,
    userPermissionModel,
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
      const permissionDoc = await permissionModel?.getOne(permissionFilter);

      if (!permissionDoc) {
        return res.status(403).json({ message: `El permiso '${permissionName}' no existe.` });
      }

      const assignment = await userPermissionModel?.getOne({
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
