import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

/**
 * Contact model definition using the OwlModel factory.
 * Handles structural properties for contact entries, including relational references to phone numbers, emails, addresses, and states.
 */
export default OwlModel("Contact", {
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
});
