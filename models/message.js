import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";


export default OwlModel("Message", {
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