import DBModel from "./../utils/model.js";

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
