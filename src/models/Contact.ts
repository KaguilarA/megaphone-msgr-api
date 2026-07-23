import { Schema, model, Document, Types } from 'mongoose';

export interface IContact extends Document {
  name: string;
  phoneNumbers: Types.ObjectId[];
  emails?: Types.ObjectId[];
  addresses?: Types.ObjectId[];
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del contacto es obligatorio.'],
      trim: true
    },
    phoneNumbers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PhoneNumber',
        required: true
      }
    ],
    emails: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Email'
      }
    ],
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address'
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Contact = model<IContact>('Contact', ContactSchema);