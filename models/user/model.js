import { Schema } from "mongoose";

const model = {
  name: {
    type: String,
    required: [true, "El nombre es obligatorio."],
    trim: true,
  },
  lastName: {
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
};

const name = "User";

const encryptedFields = [];

const hashedFields = ["password"];

/**
 * Schema data for an authenticated user account.
 * `hashedFields` instructs the OwlModel factory to hash `password` before persistence.
 */
export default { encryptedFields, hashedFields, model, name };
