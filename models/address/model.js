import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

/**
 * Address model definition using the OwlModel factory.
 * Handles structural properties for geographical and location data, including relational state reference.
 */
export default OwlModel("Address", {
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
});
