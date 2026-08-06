import address from "../db/models/address.js";
import contact from "../db/models/contact.js";
import email from "../db/models/email.js";
import phoneNumber from "../db/models/phoneNumber.js";
import user from "../db/models/user.js";
import userTokens from "../db/models/userTokens.js";

import AddressRouter from "./routes/address.routes.js";
import AuthRouter from "./routes/auth.routes.js";
import ContactRouter from "./routes/contact.routes.js";
import EmailRouter from "./routes/email.routes.js";
import PhoneNumberRouter from "./routes/phoneNumber.routes.js";
import UserRouter from "./routes/user.routes.js";
import UserTokensRouter from "./routes/userTokens.routes.js";

export default [
  {
    url: "/address",
    config: {
      id: "Address",
      model: address,
    },
    controller: AddressRouter,
  },
  {
    url: "/auth",
    config: {
      id: "Auth",
      models: [
        {
          id: "User",
          model: user,
          populatedFields: [
            "addresses",
            "contacts",
            "contacts.phoneNumbers",
            "contacts.emails",
            "contacts.addresses",
            "email",
            "phoneNumber",
            "userTokens",
          ],
        },
        {
          id: "Email",
          model: email,
        },
      ],
    },
    controller: AuthRouter,
  },
  {
    url: "/contact",
    config: {
      id: "Contact",
      model: contact,
      populatedFields: ["addresses", "emails", "phoneNumbers"],
    },
    controller: ContactRouter,
  },
  {
    url: "/email",
    config: {
      id: "Email",
      model: email,
    },
    controller: EmailRouter,
  },
  {
    url: "/phone-number",
    config: {
      id: "Phone Number",
      model: phoneNumber,
    },
    controller: PhoneNumberRouter,
  },
  {
    url: "/user",
    config: {
      id: "User",
      model: user,
      populatedFields: [
        "addresses",
        "contacts",
        "contacts.phoneNumbers",
        "contacts.emails",
        "contacts.addresses",
        "email",
        "phoneNumber",
        "userTokens",
      ],
    },
    controller: UserRouter,
  },
  {
    url: "/tokens",
    config: {
      id: "UserToken",
      model: userTokens,
    },
    controller: UserTokensRouter,
  },
];
