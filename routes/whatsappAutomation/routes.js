import { Router } from "express";
import { OwlIsAuth } from "owl-expressjs-utils";
import ActionLogMiddleware from "../../middlewares/recordLog/recordLog.js";
import routePermission from "../../middlewares/permission/routePermission.js";
import WhatsAppAutomationController from "../../controllers/whatsappAutomation/controller.js";

export default (data) => {
  const router = Router();
  const controller = WhatsAppAutomationController(data);
  const auditDependencies = {
    actionLogModel: data.actionLogModel,
    permissionModel: data.permissionModel,
    entity: "Message",
  };

  router.use(OwlIsAuth);
  router.get("/", routePermission(data, "register"), controller.get);
  router.put(
    "/",
    routePermission(data, "register"),
    ActionLogMiddleware(auditDependencies, "register"),
    controller.update,
  );

  return router;
};
