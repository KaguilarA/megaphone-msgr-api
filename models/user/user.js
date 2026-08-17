import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

/**
 * User model definition using the OwlModel factory.
 * Handles structural properties for user accounts, relationships, and secure password hashing.
 */
export default OwlModel(
  "User",
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "El apellido es obligatorio."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria."],
      trim: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
    },
  },
  [],
  ["password"],
);
