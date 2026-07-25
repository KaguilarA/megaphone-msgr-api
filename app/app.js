import { Router } from "express";
import CountriesRouter from "./components/countries/contries.routes.js";
import ViewContactRouter from "./components/contact/contact.routes.js";
import ViewUserRouter from "./components/user/user.routes.js";

export default ([contact, user]) => {
  const router = Router();

  router.use("/countries", CountriesRouter);
  router.use("/contact", ViewContactRouter(contact));
  router.use("/user", ViewUserRouter(user));

  return router;
};