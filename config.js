import address from "./db/models/address.js";
import contact from "./db/models/contact.js";
import email from "./db/models/email.js";
import message from "./db/models/message.js";
import phoneNumber from "./db/models/phoneNumber.js";
import user from "./db/models/user.js";
import tokens from "./db/models/tokens.js";

import AddressRouter from "./routes/address.js";
import AuthRouter from "./routes/auth.js";
import ContactRouter from "./routes/contact.js";
import EmailRouter from "./routes/email.js";
import MessageRouter from "./routes/message.js";
import PhoneNumberRouter from "./routes/phoneNumber.js";
import UserRouter from "./routes/user.js";
import UserTokensRouter from "./routes/userTokens.js";

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
            "tokens",
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
    url: "/message",
    config: {
      entityId: "Message",
      model: message,
      populatedFields: ["sender", "receiver", "state"],
    },
    router: MessageRouter,
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
        "tokens",
      ],
    },
    router: UserRouter,
  },
  {
    url: "/tokens",
    config: {
      entityId: "Token",
      model: tokens,
    },
    router: UserTokensRouter,
  },
];