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

/** Schema definition for a user-owned or contact-owned phone number. */
export default { model, name};
