import { Router } from "express";
import {
  createEmail,
  getEmails,
  getEmailById,
  updateEmail,
  deleteEmail,
} from "./email.controller.js";

const EmailRouter = Router();

EmailRouter.post("/", createEmail);
EmailRouter.get("/", getEmails);
EmailRouter.get("/:id", getEmailById);
EmailRouter.put("/:id", updateEmail);
EmailRouter.delete("/:id", deleteEmail);

export default EmailRouter;
