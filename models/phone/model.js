import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import StateData from "../state/model.js";
import UserData from "../user/model.js";

const OwnerTypes = [UserData.name, ContactData.name];
const model = {
  phone: {
    type: String,
    required: [true, "El número de teléfono es obligatorio."],
    trim: true,
    index: true,
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
      ref: StateData.name,
      required: true,
    },
  ],
};
const name = "Phone";

/**
 * Schema data for a phone number owned by a user or contact.
 * A phone may reference multiple `State` documents through its state array.
 */
export default { model, name};
