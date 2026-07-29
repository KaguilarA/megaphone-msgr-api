import DBModel from "../utils/model.js";

/**
 * UserToken model definition using the DBModel factory.
 * Handles structural properties for communication tokens and enables field-level encryption.
 */
export default DBModel(
  "UserToken",
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
  },
  ["emailToken", "whatsappToken", "telegramToken"],
);
