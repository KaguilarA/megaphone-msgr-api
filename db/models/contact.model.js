import { Schema } from "mongoose";
import DBModel from "./../utils/model.js";

export default new DBModel("Contact", {
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
});
