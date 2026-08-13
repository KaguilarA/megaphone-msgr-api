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
  phoneNumbers: [
    {
      type: Schema.Types.ObjectId,
      ref: "PhoneNumber",
      required: true,
    },
  ],
  emails: [
    {
      type: Schema.Types.ObjectId,
      ref: "Email",
    },
  ],
  addresses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
});
