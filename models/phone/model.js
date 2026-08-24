import { Schema } from "mongoose";

const OwnerTypes = ["User", "Contact"];

/**
 * PhoneNumber model definition using the OwlModel factory.
 * Handles structural properties for phone numbers, country codes, and relational state references.
 */
export const modelName = "PhoneNumber";

export default {
  phone: {
    type: String,
    required: [true, "El número de teléfono es obligatorio."],
    trim: true,
  },
  countryNumber: {
    type: String,
    required: [true, "El código de país es obligatorio."],
    trim: true,
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
  state: [
    {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  ],
};;
