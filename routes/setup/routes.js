import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import SetupController from "../../controllers/setup/controller.js";
import routePermission from "../../middlewares/permission/routePermission.js";

export default (data) => {
  const router = Router();
  const controller = SetupController(data);
  router.use(OwlIsAuth);
  router.get("/status", routePermission(data, data.actions.getStatus), controller.status);
  router.post("/complete", routePermission(data, data.actions.complete), controller.complete);
  return router;
};
