import { Router } from "express";
import AddressRouter from "./components/address/address.routes";
import ContactRouter from "./components/contact/contact.routes";
import EmailRouter from "./components/email/email.routes";
import PhoneNumberRouter from "./components/phoneNumber/phoneNumber.routes";

const router = Router();

router.use("/address", AddressRouter);
router.use("/contact", ContactRouter);
router.use("/email", EmailRouter);
router.use("/phone-number", PhoneNumberRouter);

export default router;
