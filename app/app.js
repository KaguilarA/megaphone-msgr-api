import { Router } from "express";
import CountriesRouter from "./components/countries/contries.routes.js";
import ViewAuthRouter from "./components/auth/auth.routes.js";
import ViewContactRouter from "./components/contact/contact.routes.js";
import { ensureUserWithContacts } from "../config/auth.js";

import AppConfig from "./index.js";

export default ([contact, user, auth]) => {
  const router = Router();

  router.use("/countries", CountriesRouter);
  router.use("/contact", ensureUserWithContacts, ViewContactRouter(contact));
  router.use("/auth", ViewAuthRouter(auth));

  return router;
};