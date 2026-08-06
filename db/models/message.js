import { Schema } from "mongoose";
import AmpApiModel from "../utils/model.js";


export default AmpApiModel("Message", {
  content: {
    type: String,
    required: [true, "El contenido del mensaje es obligatorio."],
    trim: true,
  },
  dateSended: {
    type: Date,
    default: Date.now(),
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
  ],
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
});