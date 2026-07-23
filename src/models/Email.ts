import { Schema, model, Document } from 'mongoose';

export interface IEmail extends Document {
  email: string;
}

const EmailSchema = new Schema<IEmail>(
  {
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El formato del correo electrónico no es válido.']
    }
  },
  {
    timestamps: true
  }
);

export const Email = model<IEmail>('Email', EmailSchema);