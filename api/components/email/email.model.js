import { Schema, model } from "mongoose";

const EmailSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "El formato del correo electrónico no es válido.",
      ],
    },
  },
  {
    timestamps: true,
  },
);

export const Email = model("Email", EmailSchema);
