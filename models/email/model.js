import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import StateData from "../state/model.js";
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
    ref: StateData.name,
    required: true,
  },
};

const name = "Email"

/**
 * Email model definition using the OwlModel factory.
 * Handles structural properties for electronic mail validation, uniqueness, and relational state reference.
 */
export default { model, name };

