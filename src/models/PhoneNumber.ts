import { Schema, model, Document } from 'mongoose';

export interface IPhoneNumber extends Document {
  phone: string;
  countryNumber: string;
}

const PhoneNumberSchema = new Schema<IPhoneNumber>(
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

export const PhoneNumber = model<IPhoneNumber>('PhoneNumber', PhoneNumberSchema);