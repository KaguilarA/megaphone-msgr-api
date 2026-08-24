import { Schema } from "mongoose";

export const modelName = "MessageReceptor";

export default {
  message: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: "Contact",
    required: true,
  },
};;
