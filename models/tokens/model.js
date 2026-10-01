import { Schema } from "mongoose";
import PhoneData from "../phone/model.js";
import UserData from "../user/model.js";

const encryptedFields = [
  "emailToken",
  "whatsappToken",
  "telegramBotToken",
];

const model = {
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

/**
 * Schema data for provider credentials owned by a user.
 * `encryptedFields` identifies token values that the OwlModel factory encrypts at persistence time.
 */
export default { encryptedFields, model, name };
