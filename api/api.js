import { Router } from "express";
import AddressRouter from "./routes/address.routes.js";
import ContactRouter from "./routes/contact.routes.js";
import EmailRouter from "./routes/email.routes.js";
import PhoneNumberRouter from "./routes/phoneNumber.routes.js";

export default ([address, contact, email, phoneNumber]) => {
  const router = Router();

  router.use("/address", AddressRouter(address));
  router.use("/contact", ContactRouter(contact));
  router.use("/email", EmailRouter(email));
  router.use("/phone-number", PhoneNumberRouter(phoneNumber));

  return router;
};