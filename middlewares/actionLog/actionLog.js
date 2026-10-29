import { parsePermissionReference } from "../permission/permissionKey.js";
import { ActionLogModel, PermissionModel } from "./../../models/models.js";

export function redactAuditMetadata(value) {
  if (Array.isArray(value)) return value.map(redactAuditMetadata);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    /password|token|secret|authorization|cookie/i.test(key) ? "[REDACTED]" : redactAuditMetadata(item),
  ]));
}

/**
 * Create middleware that records a completed response against a permission.
 * The permission is read from `req.permission` when validation already ran;
 * otherwise the configured action is resolved with its separate entity.
 * @param {{entity?: string, action?: string, actionLogModel?: Object, permissionModel?: Object, getActionName?: Function, getMetadata?: Function, shouldRun?: boolean}} dependencies - Audit configuration.
 * @returns {import('express').RequestHandler} Action-log middleware.
 */
export default ({
  entity,
  action = "action",
  actionLogModel = ActionLogModel,
  permissionModel = PermissionModel,
  getActionName,
  getMetadata,
  shouldRun = true,
}) =>
  function actionLogMiddlewareFn(req, res, next) {
    if (!shouldRun) {
      return next();
    }

    const userId = req.session?.userId;
    let permissionId = req.permission?._id || null;

    const resolveActionName = () => {
      if (typeof getActionName === "function") return getActionName(req, res);
      return req.permissionAction || action;
    };

    const resolveMetadata = () => {
      if (typeof getMetadata === "function") return getMetadata(req, res);
      return {
        method: req.method,
        url: req.originalUrl || req.url,
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
        permission: req.permissionName || null,
      };
    };

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalEnd = res.end.bind(res);
    let recorded = false;

    const recordLog = async (statusCode) => {
      if (recorded) return;
      recorded = true;
      try {
        if (!userId) return;

        if (!permissionId) {
          const permissionReference = parsePermissionReference(
            resolveActionName(),
            req.permissionEntity || entity,
          );
          const permissionFilter = permissionReference.entity
            ? permissionReference
            : { name: permissionReference.name };
          const permission = await permissionModel.getOne(permissionFilter);
          permissionId = permission?._id || null;
        }

        if (!permissionId) return;

        await actionLogModel.save({
          user: userId,
          permission: permissionId,
          action: resolveActionName(),
          metadata: {
            ...redactAuditMetadata(resolveMetadata()),
            statusCode,
          },
        });
      } catch (error) {
        console.error("Error registrando action log:", error.name);
      }
    };

    res.json = async function jsonWithLog(body) {
      const result = await originalJson(body);
      await recordLog(res.statusCode || 200);
      return result;
    };

    res.send = async function sendWithLog(body) {
      const result = await originalSend(body);
      await recordLog(res.statusCode || 200);
      return result;
    };

    res.end = async function endWithLog(chunk, encoding) {
      const result = await originalEnd(chunk, encoding);
      await recordLog(res.statusCode || 200);
      return result;
    };

    return next();
  };
