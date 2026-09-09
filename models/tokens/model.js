import { Schema } from "mongoose";
import UserData from "../user/model.js";

const encryptedFields = ["emailToken", "whatsappToken", "telegramToken"];

const model = {
  emailToken: {
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
  telegramToken: {
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
 * UserToken model definition using the OwlModel factory.
 * Handles structural properties for communication tokens and enables field-level encryption.
 */
export default { encryptedFields, model, name };
