import { Schema } from "mongoose";

export const modelName = "Contact";

/**
 * Contact model definition using the OwlModel factory.
 * Handles structural properties for contact entries, including relational references to phone numbers, emails, addresses, and states.
 */
/** Schema definition for a user-owned contact. */
export default {
  name: {
    type: String,
    required: [true, "El nombre del contacto es obligatorio."],
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};;

