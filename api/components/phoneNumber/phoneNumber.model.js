import { Schema, model } from "mongoose";

const PhoneNumberSchema = new Schema(
  {
    phone: {
      type: String,
      required: [true, 'El número de teléfono es obligatorio.'],
      trim: true
    },
    countryNumber: {
      type: String,
      required: [true, 'El código de país es obligatorio.'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

PhoneNumberSchema.index({ phone: 1, countryNumber: 1 }, { unique: true });

export const PhoneNumber = model('PhoneNumber', PhoneNumberSchema);