import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const MessageData = {
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
};

export default OwlModel("Message", MessageData);