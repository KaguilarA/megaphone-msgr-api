import { Schema } from "mongoose";

const OwnerTypes = ["User", "Contact"];

export const modelName = "Email";

/**
 * Email model definition using the OwlModel factory.
 * Handles structural properties for electronic mail validation, uniqueness, and relational state reference.
 */
/** Schema definition for a user-owned or contact-owned email address. */
export default {
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio."],
    unique: true,
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
    required: true
  },
};;

