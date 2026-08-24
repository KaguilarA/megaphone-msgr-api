import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const TokenData = {
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
};

const encryptedFields = ["emailToken", "whatsappToken", "telegramToken"];

/**
 * UserToken model definition using the OwlModel factory.
 * Handles structural properties for communication tokens and enables field-level encryption.
 */
export default OwlModel("Token", TokenData, encryptedFields);
