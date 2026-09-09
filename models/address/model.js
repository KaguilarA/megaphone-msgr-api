import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import StateData from "../state/model.js";
import UserData from "../user/model.js";

const OwnerTypes = [UserData.name, ContactData.name];

/**
 * Address model definition using the OwlModel factory.
 * Handles structural properties for geographical and location data, including relational state reference.
 */
/** Schema definition for user-owned and contact-owned addresses. */
export default {
  model: {
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
      enum: OwnerTypes,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: StateData.name,
    },
  },
  name: "Address",
};

