import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import UserData from "../user/model.js";

const OwnerTypes = [UserData.name, ContactData.name];

const model = {
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio."],
    trim: true,
    lowercase: true,
    match: [
      /^\S+@\S+\.\S+$/,
      "El formato del correo electrónico no es válido.",
    ],
  },
  smtpHost: {
    type: String,
    trim: true,
  },
  smtpPort: {
    type: Number,
    min: 1,
    max: 65535,
  },
  smtpUser: {
    type: String,
    trim: true,
  },
  smtpPassword: {
    type: String,
    trim: true,
  },
  smtpSecure: {
    type: Boolean,
    default: false,
  },
  smtpFromName: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "ownerType",
    index: true,
  },
  ownerType: {
    type: String,
    required: true,
    enum: OwnerTypes,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
};

const name = "Email"
const schema = new Schema(model);
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { ownerType: "User" }, name: "unique_user_email" });
const encryptedFields = ["smtpPassword"];

/**
 * Schema data for a normalized email owned by a user or contact.
 * The schema validates format and lowercases the value but does not enforce uniqueness.
 */
export default { encryptedFields, model, name, schema };

