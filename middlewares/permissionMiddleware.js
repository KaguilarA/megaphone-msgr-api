export const requirePermission = (permissionName, options = {}) => {
  const {
    action = "access",
    actionMessage = "No tienes permisos para ejecutar esta acción.",
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

      const permissionDoc = await effectivePermissionModel.getOne({ name: permissionName });

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
      req.permissionName = permissionName;
      req.permissionAction = action;

      return next();
    } catch (error) {
      console.error("Error validando permisos:", error);
      return res.status(500).json({ message: "Error validando permisos." });
    }
  };
};

export const actionLogMiddleware = (options = {}) => {
  const {
    actionLogModel,
    permissionModel,
    action = "action",
    getActionName,
    getMetadata,
    shouldRun = true,
  } = options;

  return function actionLogMiddlewareFn(req, res, next) {
    if (!shouldRun || !actionLogModel) {
      return next();
    }

    const userId = req.session?.userId || req.user?._id || req.user?.id;
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

        if (!permissionId && permissionModel) {
          const permission = await permissionModel.getOne({ name: resolveActionName() });
          permissionId = permission?._id || null;
        }

        if (!permissionId) return;

        await actionLogModel.save({
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
};

/**
 * Create a reusable action-log middleware for a configured route.
 * @param {{actionLogModel: Object, permissionModel?: Object}} dependencies - Models used by the middleware.
 * @param {string} action - Permission/action name recorded in the audit entry.
 * @returns {import('express').RequestHandler} Configured action-log middleware.
 */
export const createActionLogMiddleware = (dependencies, action) =>
  actionLogMiddleware({
    ...dependencies,
    action,
  });
