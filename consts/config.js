import { countries } from "country-codes-flags-phone-codes";

import {
  ActionLogModel,
  AddressModel,
  ContactModel,
  EmailModel,
  MessageModel,
  MessageReceptorModel,
  PermissionModel,
  PhoneNumberModel,
  StateModel,
  TokenModel,
  UserModel,
  UserPermissionModel,
} from "../models/models.js";

import AddressRouter from "../routes/address/routes.js";
import AuthRouter from "../routes/auth/routes.js";
import ContactRouter from "../routes/contact/routes.js";
import CountriesRouter from "../routes/countries/routes.js";
import EmailRouter from "../routes/email/routes.js";
import MessageRouter from "../routes/message/routes.js";
import PhoneNumberRouter from "../routes/phone/routes.js";
import StateRouter from "../routes/state/routes.js";
import UserRouter from "../routes/user/routes.js";
import UserTokensRouter from "../routes/userTokens/routes.js";
import ActionLogRouter from "../routes/actionLog/routes.js";

export default [
  {
    url: "/address",
    config: {
      id: "Address",
      model: AddressModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        postUser: "address:addUserAddress",
        postContact: "address:addContactAddress",
        update: "address:edit",
        delete: "address:delete",
      },
    },
    router: AddressRouter,
  },
  {
    url: "/auth",
    config: {
      id: "Auth",
      model: UserModel,
      emailModel: EmailModel,
    },
    router: AuthRouter,
  },
  {
    url: "/contact",
    config: {
      id: "Contact",
      model: ContactModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: ContactRouter,
  },
  {
    url: "/countries",
    config: {
      id: "Countries",
      model: countries,
    },
    router: CountriesRouter,
  },
  {
    url: "/message",
    config: {
      id: "Message",
      model: MessageModel,
      receptorModel: MessageReceptorModel,
      populatedFields: ["sender", "state"],
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: MessageRouter,
  },
  {
    url: "/email",
    config: {
      id: "Email",
      model: EmailModel,
      contactModel: ContactModel,
      stateModel: StateModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: EmailRouter,
  },
  {
    url: "/phone-number",
    config: {
      id: "Phone Number",
      model: PhoneNumberModel,
      contactModel: ContactModel,
      stateModel: StateModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: PhoneNumberRouter,
  },
  {
    url: "/state",
    config: {
      id: "State",
      model: StateModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: StateRouter,
  },
  {
    url: "/user",
    config: {
      id: "User",
      model: UserModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: UserRouter,
  },
  {
    url: "/tokens",
    config: {
      id: "Token",
      model: TokenModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: UserTokensRouter,
  },
  {
    url: "/action-log",
    config: {
      id: "ActionLog",
      model: ActionLogModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        post: "actionLog:add",
        update: "actionLog:edit",
        delete: "actionLog:delete",
      },
    },
    router: ActionLogRouter,
  },
];
