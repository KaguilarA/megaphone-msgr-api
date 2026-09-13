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
import UserPermissionRouter from "../routes/userPermission/routes.js";
import PermissionRouter from "../routes/permission/routes.js";
import UserTokensRouter from "../routes/userTokens/routes.js";
import ActionLogRouter from "../routes/actionLog/routes.js";

export default [
  {
    url: "/action-log",
    config: {
      id: "ActionLog",
      model: ActionLogModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getAll: "getAll",
        getById: "getById",
      },
    },
    router: ActionLogRouter,
  },

  {
    url: "/address",
    config: {
      id: "Address",
      model: AddressModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getAll: "getAll",
        getByCoincidence: "getByCoincidence",
        post: "register",
        getById: "getDataById",
        getContact: "getDataForContact",
        getUser: "getDataForUser",
        postUser: "registerForUser",
        postContact: "registerForContact",
        update: "updateDataById",
        delete: "deleteDataById",
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
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getById: "getById",
        getAll: "getAll",
        post: "register",
        update: "updateById",
        delete: "deleteById",
      },
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
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getAll: "getAll",
        getById: "getById",
        post: "register",
      },
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
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getById: "getDataById",
        getContact: "getDataForContact",
        getUser: "getDataForUser",
        postContact: "registerForContact",
        postUser: "registerForUser",
        update: "updateDataById",
        delete: "deleteDataById",
      },
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
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getById: "getDataById",
        getContact: "getDataForContact",
        getUser: "getDataForUser",
        postContact: "registerForContact",
        postUser: "registerForUser",
        update: "updateDataById",
        delete: "deleteDataById",
      },
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
      actions: {
        getAll: "getAll",
        getByCoincidence: "getByCoincidence",
        post: "register",
      },
    },
    router: StateRouter,
  },
  {
    url: "/user",
    config: {
      id: "User",
      userModel: UserModel,
      emailModel: EmailModel,
      stateModel: StateModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        getAll: "getAll",
        getById: "getById",
        getInfo: "getInfo",
        getPermissions: "getPermissions",
        updatePermissions: "updatePermissions",
        post: "register",
        update: "update",
      },
    },
    router: UserRouter,
  },
  {
    url: "/user-permission",
    config: {
      id: "UserPermission",
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
    },
    router: UserPermissionRouter,
  },
  {
    url: "/permission",
    config: {
      // Reuses the User:getPermissions permission since listing the catalog
      // is only needed while managing a user's permission assignments.
      id: "User",
      model: PermissionModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actions: {
        getAll: "getPermissions",
      },
    },
    router: PermissionRouter,
  },
  {
    url: "/tokens",
    config: {
      id: "Token",
      model: TokenModel,
      permissionModel: PermissionModel,
      userPermissionModel: UserPermissionModel,
      actionLogModel: ActionLogModel,
      actions: {
        post: "register",
        getById: "getById",
        update: "update",
        delete: "delete",
      },
    },
    router: UserTokensRouter,
  },
];
