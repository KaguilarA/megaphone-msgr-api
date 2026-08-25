import { Schema } from "mongoose";

export const modelName = "Address";

/**
 * Address model definition using the OwlModel factory.
 * Handles structural properties for geographical and location data, including relational state reference.
 */
/** Schema definition for user-owned and contact-owned addresses. */
export default {
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
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
    enum: ["User", "Contact"],
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};

