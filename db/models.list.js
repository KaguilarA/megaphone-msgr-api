import address from "./models/address.model.js";
import contact from "./models/contact.model.js";
import email from "./models/email.model.js";
import phoneNumber from "./models/phoneNumber.model.js";
import user from "./models/user.model.js";

export default {
  api: [address, contact, email, phoneNumber, user],
  app: [contact, user],
};
