import { OwlModel } from "owl-expressjs-utils";

import AddressData, { modelName as AddressModelName } from "./address/model.js";
import ContactData, { modelName as ContactModelName } from "./contact/model.js";
import EmailData, { modelName as EmailModelName } from "./email/model.js";
import MessageData, { modelName as MessageModelName } from "./message/model.js";
import MessageReceptorData, {
  modelName as MessageReceptorModelName,
} from "./messageReceptor/model.js";
import PermissionData, {
  modelName as PermissionModelName,
} from "./permission/model.js";
import PhoneNumberData, {
  modelName as PhoneNumberModelName,
} from "./phone/model.js";
import StateData, { modelName as StateModelName } from "./state/model.js";
import TokenData, {
  encryptedFields as TokenEncryptedFields,
  modelName as TokenModelName,
} from "./tokens/model.js";
import UserData, {
  hashedFields as UserHashedFields,
  modelName as UserModelName,
} from "./user/model.js";
import UserPermissionData, {
  modelName as UserPermissionModelName,
} from "./userPermission/model.js";
import ActionLogData, {
  modelName as ActionLogModelName,
} from "./actionLog/model.js";

export const AddressModel = OwlModel(AddressModelName, AddressData);
export const ContactModel = OwlModel(ContactModelName, ContactData);
export const EmailModel = OwlModel(EmailModelName, EmailData);
export const MessageModel = OwlModel(MessageModelName, MessageData);
export const MessageReceptorModel = OwlModel(
  MessageReceptorModelName,
  MessageReceptorData,
);
export const PermissionModel = OwlModel(PermissionModelName, PermissionData);
export const PhoneNumberModel = OwlModel(PhoneNumberModelName, PhoneNumberData);
export const StateModel = OwlModel(StateModelName, StateData);
export const TokenModel = OwlModel(
  TokenModelName,
  TokenData,
  TokenEncryptedFields,
);
export const UserModel = OwlModel(
  UserModelName,
  UserData,
  [],
  UserHashedFields,
);
export const UserPermissionModel = OwlModel(
  UserPermissionModelName,
  UserPermissionData,
);
export const ActionLogModel = OwlModel(ActionLogModelName, ActionLogData);
