import { Router } from "express";
import CountriesRouter from "./components/countries/contries.routes.js";
import ViewAuthRouter from "./components/auth/auth.routes.js";
import ViewContactRouter from "./components/contact/contact.routes.js";
import ViewUserRouter from "./components/user/user.routes.js";

import AppConfig from "./index.js";

export default ([contact, user, auth]) => {
  const router = Router();
  const controllers = [ViewContactRouter, ViewUserRouter, ViewAuthRouter];

  router.use("/countries", CountriesRouter);
  router.use("/user", ViewUserRouter(user));
  router.use("/contact", ViewContactRouter(contact));
  router.use("/auth", ViewAuthRouter(auth));

  return router;
};