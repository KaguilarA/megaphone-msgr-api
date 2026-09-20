import { OwlModel, OwlState, OwlCrypto } from "owl-expressjs-utils";
import { EncryptionKey } from "../consts/index.js";
import ActionLogData from "./actionLog/model.js";
import AddressData from "./address/model.js";
import ContactData from "./contact/model.js";
import EmailData from "./email/model.js";
import MessageData from "./message/model.js";
import MessageReceptorData from "./messageReceptor/model.js";
import PermissionData from "./permission/model.js";
import PhoneNumberData from "./phone/model.js";
import TokenData from "./tokens/model.js";
import UserData from "./user/model.js";
import UserPermissionData from "./userPermission/model.js";

OwlCrypto.setEncryptionKey(EncryptionKey);

const StateSupported = [
  AddressData.name,
  UserData.name,
  ContactData.name,
  EmailData.name,
  MessageData.name,
  PhoneNumberData.name,
];

export const StateModel = OwlState(StateSupported);

/** Central registry of instantiated application models. */
export const ActionLogModel = OwlModel(ActionLogData.name, ActionLogData.model);
export const AddressModel = OwlModel(AddressData.name, AddressData.model);
export const ContactModel = OwlModel(ContactData.name, ContactData.model);
export const EmailModel = OwlModel(EmailData.name, EmailData.model);
export const MessageModel = OwlModel(MessageData.name, MessageData.model);
export const MessageReceptorModel = OwlModel(
  MessageReceptorData.name,
  MessageReceptorData.model,
);
export const PermissionModel = OwlModel(
  PermissionData.name,
  PermissionData.model,
);
export const PhoneNumberModel = OwlModel(
  PhoneNumberData.name,
  PhoneNumberData.model,
);
export const TokenModel = OwlModel(
  TokenData.name,
  TokenData.model,
  TokenData.encryptedFields,
);
export const UserModel = OwlModel(
  UserData.name,
  UserData.model,
  UserData.encryptedFields,
  UserData.hashedFields,
);
export const UserPermissionModel = OwlModel(
  UserPermissionData.name,
  UserPermissionData.model,
);
