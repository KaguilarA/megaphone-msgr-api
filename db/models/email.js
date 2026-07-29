import { Schema } from "mongoose";
import AmpApiModel from "../utils/model.js";

/**
 * Email model definition using the AmpApiModel factory.
 * Handles structural properties for electronic mail validation, uniqueness, and relational state reference.
 */
export default AmpApiModel("Email", {
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
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
});
