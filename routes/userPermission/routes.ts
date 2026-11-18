import { Router } from "express";

/**
 * Create the user-permission lookup router.
 * @param {{permissionModel: Object, userPermissionModel: Object, entity?: string}} data - Permission dependencies.
 * @returns {import('express').Router} User-permission router.
 */
export default (data) => {
  const router = Router();

  router.get("/check/:permission", async (req, res) => {
    try {
      const userId = req.session?.userId || req.user?._id || req.user?.id;
      const action = req.params.permission;
      const entity = data.entity || req.query.entity;

      if (!userId || !data.permissionModel || !data.userPermissionModel) {
        return res.json({ allowed: false });
      }

      const permission = await data.permissionModel.getOne({
        ...(entity ? { entity } : {}),
        name: action,
      });

      if (!permission) {
        return res.json({ allowed: false });
      }

      const assignment = await data.userPermissionModel.getOne({
        user: userId,
        permission: permission._id,
      });

      return res.json({ allowed: Boolean(assignment) });
    } catch (error) {
      return res.status(500).json({
        allowed: false,
        error: error.message || error,
      });
    }
  });

  return router;
};
