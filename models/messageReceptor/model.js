import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import MessageData from "../message/model.js";

const model = {
  message: {
    type: Schema.Types.ObjectId,
    ref: MessageData.name,
    required: true,
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: ContactData.name,
    required: true,
  },
};

const name = "MessageReceptor";

/** Schema data for one message-to-contact recipient relationship. */
export default { model, name };
