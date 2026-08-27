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
} from "./../models/models.js";

export default [
  {
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
  {
    id: "Auth",
    model: UserModel,
    emailModel: EmailModel,
  },
  {
    id: "Contact",
    model: ContactModel,
    permissionModel: PermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "Countries",
    model: countries,
  },
  {
    id: "Email",
    model: EmailModel,
    contactModel: ContactModel,
    stateModel: StateModel,
    permissionModel: PermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "Message",
    model: MessageModel,
    receptorModel: MessageReceptorModel,
    populatedFields: ["sender", "state"],
    permissionModel: PermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "Phone Number",
    model: PhoneNumberModel,
    contactModel: ContactModel,
    stateModel: StateModel,
    permissionModel: PermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "User",
    model: UserModel,
    permissionModel: PermissionModel,
    userPermissionModel: UserPermissionModel,
    actionLogModel: ActionLogModel,
  },

  {
    id: "State",
    model: StateModel,
    permissionModel: PermissionModel,
    userPermissionModel: UserPermissionModel,
    actionLogModel: ActionLogModel,
  },

  {
    id: "Token",
    model: TokenModel,
    permissionModel: PermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "Permission",
    model: PermissionModel,
    permissionModel: PermissionModel,
    userPermissionModel: UserPermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
    id: "UserPermission",
    model: UserPermissionModel,
    permissionModel: PermissionModel,
    userPermissionModel: UserPermissionModel,
    actionLogModel: ActionLogModel,
  },
  {
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
];
