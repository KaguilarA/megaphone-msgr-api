import { Schema } from "mongoose";
import AmpApiModel from "../utils/model.js";

/**
 * Address model definition using the AmpApiModel factory.
 * Handles structural properties for geographical and location data, including relational state reference.
 */
export default AmpApiModel("Address", {
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
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
});
