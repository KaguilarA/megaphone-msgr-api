import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const OwnerTypes = ["User", "Contact"];

const EmailData = {
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
};

/**
 * Email model definition using the OwlModel factory.
 * Handles structural properties for electronic mail validation, uniqueness, and relational state reference.
 */
export default OwlModel("Email", EmailData);
