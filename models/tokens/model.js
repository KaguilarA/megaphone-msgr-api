import { Schema } from "mongoose";

const encryptedFields = ["emailToken", "whatsappToken", "telegramToken"];

/**
 * UserToken model definition using the OwlModel factory.
 * Handles structural properties for communication tokens and enables field-level encryption.
 */
export { encryptedFields };
export const modelName = "Token";

/** Schema definition for encrypted provider credentials. */
export default {
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
    ref: "User",
    required: true,
    index: true,
  },
};;
