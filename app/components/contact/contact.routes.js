import { Router } from "express";
import {
  renderContactsPage,
  renderNewContactPage,
  renderEditContactView,
  loadCountries,
} from "./contact.controller.js";

const ViewContactRouter = Router();

ViewContactRouter.get("/", renderContactsPage);
ViewContactRouter.get("/countries", loadCountries);
ViewContactRouter.get("/new", renderNewContactPage);
ViewContactRouter.get("/:id/edit", renderEditContactView);

export default ViewContactRouter;
