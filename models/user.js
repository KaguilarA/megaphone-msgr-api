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
    email: {
      type: Schema.Types.ObjectId,
      ref: "Email",
      required: true,
    },
    phoneNumber: {
      type: Schema.Types.ObjectId,
      ref: "PhoneNumber",
      required: true,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    tokens: {
      type: Schema.Types.ObjectId,
      ref: "Token",
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
    },
  },
  [],
  ["password"],
);
