import { countries } from "country-codes-flags-phone-codes";

import address from "./models/address.js";
import contact from "./models/contact.js";
import email from "./models/email.js";
import message from "./models/message.js";
import phoneNumber from "./models/phoneNumber.js";
import user from "./models/user.js";
import tokens from "./models/tokens.js";

import AddressRouter from "./routes/address.js";
import AuthRouter from "./routes/auth.js";
import ContactRouter from "./routes/contact.js";
import CountriesRouter from "./routes/countries.js";
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
      model: address
    },
    router: AddressRouter
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
            "email",
            "phoneNumber"
          ]
        },
        {
          entityId: "Email",
          model: email
        }
      ]
    },
    router: AuthRouter
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
    url: "/countries",
    config: {
      entityId: "Countries",
      model: countries
    },
    router: CountriesRouter
  },
  {
    url: "/message",
    config: {
      entityId: "Message",
      model: message,
      populatedFields: ["sender", "receiver", "state"]
    },
    router: MessageRouter
  },
  {
    url: "/email",
    config: {
      entityId: "Email",
      model: email
    },
    router: EmailRouter
  },
  {
    url: "/phone-number",
    config: {
      entityId: "Phone Number",
      model: phoneNumber
    },
    router: PhoneNumberRouter
  },
  {
    url: "/user",
    config: {
      entityId: "User",
      model: user,
      populatedFields: [
        "addresses",
        "email",
        "phoneNumber"
      ]
    },
    router: UserRouter
  },
  {
    url: "/tokens",
    config: {
      entityId: "Token",
      model: tokens
    },
    router: UserTokensRouter
  }
];
