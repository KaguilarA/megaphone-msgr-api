import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import PermissionController from "../../controllers/permission/controller.js";
import routePermission from "../../middlewares/permission/routePermission.js";

/**
 * Create the authenticated permission catalog router.
 * @param {Object} data - Configuration data for the router.
 * @returns {import('express').Router}
 */
export default (data) => {
  const router = Router();
  const { getAll } = PermissionController(data);

  router.use(OwlIsAuth);
  router.get("/", routePermission(data, data.actions.getAll), getAll);

  return router;
};
