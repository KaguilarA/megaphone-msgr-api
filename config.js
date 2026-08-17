import { countries } from "country-codes-flags-phone-codes";

import address from "./models/address/address.js";
import contact from "./models/contact/contact.js";
import email from "./models/email/email.js";
import message from "./models/message/message.js";
import phoneNumber from "./models/phone/phone.js";
import state from "./models/state/state.js";
import user from "./models/user/user.js";
import tokens from "./models/tokens/tokens.js";
import messageReceptor from "./models/messageReceptor/messageReceptor.js";

import AddressRouter from "./routes/address.js";
import AuthRouter from "./routes/auth.js";
import ContactRouter from "./routes/contact.js";
import CountriesRouter from "./routes/countries.js";
import EmailRouter from "./routes/email.js";
import MessageRouter from "./routes/message.js";
import PhoneNumberRouter from "./routes/phoneNumber.js";
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
      emailModel: email,
      phoneNumberModel: phoneNumber,
      addressModel: address,
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
      emailModel: email,
      phoneNumberModel: phoneNumber,
      addressModel: address,
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
