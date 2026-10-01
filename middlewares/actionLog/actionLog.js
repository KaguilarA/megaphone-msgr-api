import { parsePermissionReference } from "../permission/permissionKey.js";
import { ActionLogModel, PermissionModel } from "./../../models/models.js";

/**
 * Create middleware that records a completed response against a permission.
 * The permission is read from `req.permission` when validation already ran;
 * otherwise the configured action is resolved with its separate entity.
 * @param {{entity?: string, action?: string, getActionName?: Function, getMetadata?: Function, shouldRun?: boolean}} dependencies - Audit configuration.
 * @returns {import('express').RequestHandler} Action-log middleware.
 */
export default ({
  entity,
  action = "action",
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

    const recordLog = async (statusCode) => {
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
          const permission = await PermissionModel.getOne(permissionFilter);
          permissionId = permission?._id || null;
        }

        if (!permissionId) return;

        await ActionLogModel.save({
          user: userId,
          permission: permissionId,
          action: resolveActionName(),
          metadata: {
            ...resolveMetadata(),
            statusCode,
          },
        });
      } catch (error) {
        console.error("Error registrando action log:", error);
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
