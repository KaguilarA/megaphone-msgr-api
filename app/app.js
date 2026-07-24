import { Router } from "express";
import ViewContactRouter from "./components/contact/contact.routes";

const ViewRouter = Router();

ViewRouter.use("/contacts", ViewContactRouter);

export default ViewRouter;
