import { Router } from "express";
import ViewContactRouter from "./components/contact/contact.routes.js";

const ViewRouter = Router();

ViewRouter.use("/contacts", ViewContactRouter);

export default ViewRouter;
