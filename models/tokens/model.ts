import { Schema, type SchemaDefinition } from "mongoose";
import PhoneData from "../phone/model.js";
import UserData from "../user/model.js";

const encryptedFields = [
  "emailToken",
  "whatsappToken",
  "telegramBotToken",
];

const model: SchemaDefinition = {
  emailToken: {
    type: String,
    trim: true,
  },
  emailHost: {
    type: String,
    trim: true,
  },
  emailUser: {
    type: String,
    trim: true,
  },
  emailPort: {
    type: String,
    trim: true,
  },
  whatsappToken: {
    type: String,
    trim: true,
  },
  whatsappVersion: {
    type: String,
    trim: true,
    default: "",
  },
  whatsappPhoneNumberId: {
    type: String,
    trim: true,
  },
  whatsappSession: {
    type: String,
    trim: true,
    match: /^[a-zA-Z0-9._-]{1,64}$/,
  },
  phone: {
    type: Schema.Types.ObjectId,
    ref: PhoneData.name,
    index: true,
  },
  telegramBotToken: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
};

const name = "Token";
const schema = new Schema(model);
schema.index({ owner: 1, phone: 1 }, {
  unique: true,
  partialFilterExpression: { phone: { $type: "objectId" } },
  name: "unique_owner_phone_token",
});
schema.index({ whatsappSession: 1 }, {
  unique: true,
  partialFilterExpression: { whatsappSession: { $type: "string" } },
  name: "unique_whatsapp_session",
});

/**
 * Schema data for provider credentials owned by a user.
 * `encryptedFields` identifies token values that the OwlModel factory encrypts at persistence time.
 */
export default { encryptedFields, model, name, schema };
