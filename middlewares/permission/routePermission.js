import requirePermission from "./permission.js";

/**
 * Create permission middleware from a route configuration entry.
 * @param {{id?: string, entityId?: string, permissionModel?: Object, userPermissionModel?: Object}} data - Route configuration.
 * @param {string} action - Permission action name.
 * @returns {import('express').RequestHandler} Permission middleware.
 */
export default (data, action) =>
  requirePermission(action, {
    entity: data.id,
    action,
  });
