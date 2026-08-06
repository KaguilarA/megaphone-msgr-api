import address from "./db/models/address.js";
import contact from "./db/models/contact.js";
import email from "./db/models/email.js";
import phoneNumber from "./db/models/phoneNumber.js";
import user from "./db/models/user.js";
import userTokens from "./db/models/userTokens.js";

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
      entityId: "Address",
      model: address,
    },
    router: AddressRouter,
  },
  {
    url: "/auth",
    config: {
      entityId: "Auth",
      models: [
        {
          entityId: "User",
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
          entityId: "Email",
          model: email,
        },
      ],
    },
    router: AuthRouter,
  },
  {
    url: "/contact",
    config: {
      entityId: "Contact",
      model: contact,
      populatedFields: ["addresses", "emails", "phoneNumbers"],
    },
    router: ContactRouter,
  },
  {
    url: "/email",
    config: {
      entityId: "Email",
      model: email,
    },
    router: EmailRouter,
  },
  {
    url: "/phone-number",
    config: {
      entityId: "Phone Number",
      model: phoneNumber,
    },
    router: PhoneNumberRouter,
  },
  {
    url: "/user",
    config: {
      entityId: "User",
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
    router: UserRouter,
  },
  {
    url: "/tokens",
    config: {
      entityId: "UserToken",
      model: userTokens,
    },
    router: UserTokensRouter,
  },
];