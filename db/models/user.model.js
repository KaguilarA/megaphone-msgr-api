import { Schema } from "mongoose";
import DBModel from "./../utils/model.js";

export default DBModel(
  "User",
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "El apellido es obligatorio."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria."],
      trim: true,
    },
    email: {
      type: Schema.Types.ObjectId,
      ref: "Email",
    },
    emailToken: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: Schema.Types.ObjectId,
      ref: "PhoneNumber",
      required: true,
    },
    waToken: {
      type: String,
      trim: true,
    },
    telegramToken: {
      type: String,
      trim: true,
    },
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contact",
      },
    ],
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  ["emailToken", "waToken", "telegramToken"],
  ['password']
);
