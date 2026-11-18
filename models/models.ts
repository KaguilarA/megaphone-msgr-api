import mongoose, { Schema, type SchemaDefinition } from "mongoose";
import { OwlModel, OwlState, OwlCrypto } from "owl-expressjs-utils";
import type { ModelReturn } from "owl-expressjs-utils";
import {
  EncryptionAlgorithm,
  EncryptionKey,
} from "../consts/index.js";
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
import InstallationData from "./installation/model.js";
import WhatsAppAutomationData from "./whatsappAutomation/model.js";
import WhatsAppConversationMessageData from "./whatsappConversationMessage/model.js";

if (!EncryptionKey) {
  throw new Error("ENCRYPTION_KEY must be configured before creating models.");
}
OwlCrypto.setEncryptionKey(EncryptionKey);
OwlCrypto.setEncryptionAlgorithm(EncryptionAlgorithm);

const StateSupported = [
  AddressData.name,
  UserData.name,
  ContactData.name,
  EmailData.name,
  MessageData.name,
  PhoneNumberData.name,
];

export const StateModel = OwlState(StateSupported);

function createModel(
  name: string,
  schema: SchemaDefinition | Schema,
  encryptedFields: string[] = [],
  hashedFields: string[] = [],
): ModelReturn {
  // OwlModel accepts a Mongoose Schema at runtime, but its published type omits it.
  return OwlModel(
    name,
    schema as unknown as SchemaDefinition,
    encryptedFields,
    hashedFields,
  );
}

/** Central registry of instantiated application models. */
export const ActionLogModel = createModel(ActionLogData.name, ActionLogData.model);
export const AddressModel = createModel(AddressData.name, AddressData.model);
export const ContactModel = createModel(ContactData.name, ContactData.model);
export const EmailModel = createModel(
  EmailData.name,
  EmailData.schema,
  EmailData.encryptedFields,
);
export const MessageModel = Object.assign(
  createModel(MessageData.name, MessageData.schema),
  {
    getHiddenProviderMessageIds: async (owner) => {
      const hiddenMessages = await mongoose.model(MessageData.name)
        .find({
          sender: owner,
          hiddenAt: { $exists: true },
          $or: [{ channel: "whatsapp" }, { channel: { $exists: false } }],
        })
        .select("deliveries.providerMessageId")
        .lean();
      return hiddenMessages.flatMap((message) =>
        (message.deliveries || [])
          .map((delivery) => delivery.providerMessageId)
          .filter((providerMessageId) => typeof providerMessageId === "string"),
      );
    },
    getLatestForRecipient: async (owner, recipient, limit = 50) =>
      mongoose.model(MessageData.name)
        .find({
          sender: owner,
          $or: [{ channel: "whatsapp" }, { channel: { $exists: false } }],
          deliveries: {
            $elemMatch: { recipient, status: "accepted" },
          },
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("content createdAt")
        .lean(),
  },
);
export const MessageReceptorModel = createModel(
  MessageReceptorData.name,
  MessageReceptorData.model,
);
export const PermissionModel = createModel(
  PermissionData.name,
  PermissionData.schema,
);
export const PhoneNumberModel = createModel(
  PhoneNumberData.name,
  PhoneNumberData.schema,
);
export const TokenModel = createModel(
  TokenData.name,
  TokenData.schema,
  TokenData.encryptedFields,
);
export const UserModel = createModel(
  UserData.name,
  UserData.model,
  UserData.encryptedFields,
  UserData.hashedFields,
);
export const UserPermissionModel = createModel(
  UserPermissionData.name,
  UserPermissionData.schema,
);
export const InstallationModel = createModel(InstallationData.name, InstallationData.model);
export const WhatsAppAutomationModel = createModel(
  WhatsAppAutomationData.name,
  WhatsAppAutomationData.schema,
);
export const WhatsAppConversationMessageModel = Object.assign(
  createModel(
    WhatsAppConversationMessageData.name,
    WhatsAppConversationMessageData.schema,
  ),
  {
    getLatest: async (filter, limit = 50) =>
      mongoose.model(WhatsAppConversationMessageData.name)
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-owner -__v")
        .populate({ path: "contact", select: "name lastName" })
        .populate({ path: "senderPhone", select: "phone countryNumber e164" }),
  },
);
