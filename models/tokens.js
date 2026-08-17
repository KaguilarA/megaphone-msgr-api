import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

/**
 * UserToken model definition using the OwlModel factory.
 * Handles structural properties for communication tokens and enables field-level encryption.
 */
export default OwlModel(
  "Token",
  {
    emailToken: {
      type: String,
      trim: true,
    },
    whatsappToken: {
      type: String,
      trim: true,
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
  },
  ["emailToken", "whatsappToken", "telegramToken"],
);
