import express from "express";
import AddressRouter from "./components/address/address.routes.js";
import ContactRouter from "./components/contact/contact.routes.js";
import EmailRouter from "./components/email/email.routes.js";
import PhoneNumberRouter from "./components/phoneNumber/phoneNumber.routes.js";

const router = express.Router();

router.use("/address", AddressRouter);
router.use("/contact", ContactRouter);
router.use("/email", EmailRouter);
router.use("/phone-number", PhoneNumberRouter);

export default router;
