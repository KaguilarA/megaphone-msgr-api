import { Schema, model } from "mongoose";
import { DBModel } from './../utils/model.js'

const PhoneNumberSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

PhoneNumberSchema.index({ phone: 1, countryNumber: 1 }, { unique: true });

const PhoneNumber = model("PhoneNumber", PhoneNumberSchema);

export const PhoneNumberModel = new DBModel(PhoneNumber);

