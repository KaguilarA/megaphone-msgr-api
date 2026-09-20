import { Schema } from "mongoose";
import UserData from "../user/model.js";

const model = {
  name: {
    type: String,
    required: [true, "El nombre del contacto es obligatorio."],
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};

const name = "Contact"

/**
 * Schema data for a user-owned contact.
 * Emails, phone numbers, and addresses are stored as separate owner-scoped documents.
 */
export default { model, name };
