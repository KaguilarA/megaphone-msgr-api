import { countries } from "country-codes-flags-phone-codes";

import address from "./models/address/model.js";
import contact from "./models/contact/model.js";
import email from "./models/email/model.js";
import message from "./models/message/model.js";
import phoneNumber from "./models/phone/model.js";
import state from "./models/state/model.js";
import user from "./models/user/model.js";
import tokens from "./models/tokens/model.js";
import messageReceptor from "./models/messageReceptor/model.js";

import AddressRouter from "./routes/address/routes.js";
import AuthRouter from "./routes/auth/routes.js";
import ContactRouter from "./routes/contact/routes.js";
import CountriesRouter from "./routes/countries/routes.js";
import EmailRouter from "./routes/email/routes.js";
import MessageRouter from "./routes/message.js";
import PhoneNumberRouter from "./routes/phone/routes.js";
import StateRouter from "./routes/state.js";
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
    },
    router: ContactRouter,
  },
  {
    url: "/countries",
    config: {
      entityId: "Countries",
      model: countries,
    },
    router: CountriesRouter,
  },
  {
    url: "/message",
    config: {
      entityId: "Message",
      model: message,
      receptorModel: messageReceptor,
      populatedFields: ["sender", "state"],
    },
    router: MessageRouter,
  },
  {
    url: "/email",
    config: {
      entityId: "Email",
      model: email,
      contactModel: contact,
    },
    router: EmailRouter,
  },
  {
    url: "/phone-number",
    config: {
      entityId: "Phone Number",
      model: phoneNumber,
      contactModel: contact,
    },
    router: PhoneNumberRouter,
  },
  {
    url: "/state",
    config: {
      entityId: "State",
      model: state,
    },
    router: StateRouter,
  },
  {
    url: "/user",
    config: {
      entityId: "User",
      model: user,
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
