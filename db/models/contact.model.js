import { Schema, model } from "mongoose";

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del contacto es obligatorio."],
      trim: true,
    },
    phoneNumbers: [
      {
        type: Schema.Types.ObjectId,
        ref: "PhoneNumber",
        required: true,
      },
    ],
    emails: [
      {
        type: Schema.Types.ObjectId,
        ref: "Email",
      },
    ],
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Contact = model("Contact", ContactSchema);
