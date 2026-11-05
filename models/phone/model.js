import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
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
  tokens: {
    whatsapp: {
      type: Schema.Types.ObjectId,
      ref: "Token",
    },
    telegram: {
      type: Schema.Types.ObjectId,
      ref: "Token",
    },
  },
  state: [
    {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  ],
};
const name = "Phone";
const schema = new Schema({ ...model, e164: { type: String, match: /^\+[1-9]\d{7,14}$/ } });
schema.index({ ownerType: 1, owner: 1, e164: 1 }, {
  unique: true,
  partialFilterExpression: { e164: { $type: "string" } },
  name: "unique_owner_phone",
});

/**
 * Schema data for a phone number owned by a user or contact.
 * A phone may reference multiple `State` documents through its state array.
 */
export default { model, name, schema };
