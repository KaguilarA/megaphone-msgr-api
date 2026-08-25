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
} from "./models/models.js";

import AddressRouter from "./routes/address/routes.js";
import AuthRouter from "./routes/auth/routes.js";
import ContactRouter from "./routes/contact/routes.js";
import CountriesRouter from "./routes/countries/routes.js";
import EmailRouter from "./routes/email/routes.js";
import MessageRouter from "./routes/message/routes.js";
import PhoneNumberRouter from "./routes/phone/routes.js";
import StateRouter from "./routes/state/routes.js";
import UserRouter from "./routes/user/routes.js";
import UserTokensRouter from "./routes/userTokens/routes.js";
import PermissionRouter from "./routes/permissions/routes.js";
import UserPermissionRouter from "./routes/userPermission/routes.js";
import ActionLogRouter from "./routes/actionLog/routes.js";

export default [
  {
    url: "/address",
    config: {
      entityId: "Address",
      model: AddressModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
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
          model: UserModel,
        },
        {
          entityId: "Email",
          model: EmailModel,
        },
      ],
    },
    router: AuthRouter,
  },
  {
    url: "/contact",
    config: {
      entityId: "Contact",
      model: ContactModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
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
      entityId: "Email",
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
      entityId: "Phone Number",
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
      entityId: "State",
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
      entityId: "User",
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
      entityId: "Token",
      model: TokenModel,
      permissionModel: PermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: UserTokensRouter,
  },
  {
    url: "/permission",
    config: {
      entityId: "Permission",
      model: PermissionModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: PermissionRouter,
  },
  {
    url: "/user-permission",
    config: {
      entityId: "UserPermission",
      model: UserPermissionModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: UserPermissionRouter,
  },
  {
    url: "/action-log",
    config: {
      entityId: "ActionLog",
      model: ActionLogModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
    },
    router: ActionLogRouter,
  },
];
