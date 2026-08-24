import { Schema } from "mongoose";

export const modelName = "Message";

export default {
  content: {
    type: String,
    required: [true, "El contenido del mensaje es obligatorio."],
    trim: true,
  },
  header: {
    type: String,
    required: [true, "La cabecera del mensaje es obligatorio."],
    trim: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};;
