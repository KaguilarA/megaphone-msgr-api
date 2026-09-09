import { Schema } from "mongoose";
import StateData from "../state/model.js";
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
    ref: StateData.name,
  },
};

const name = "Contact"

/**
 * Contact model definition using the OwlModel factory.
 * Handles structural properties for contact entries, including relational references to phone numbers, emails, addresses, and states.
 */
/** Schema definition for a user-owned contact. */
export default { model, name };
