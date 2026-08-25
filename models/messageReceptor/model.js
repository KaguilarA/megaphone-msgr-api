import { Schema } from "mongoose";

export const modelName = "MessageReceptor";

/** Schema definition for a message-to-contact recipient relationship. */
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
