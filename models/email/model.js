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

/**
 * Schema data for a normalized email owned by a user or contact.
 * The schema validates format and lowercases the value but does not enforce uniqueness.
 */
export default { model, name };

