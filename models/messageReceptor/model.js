import { Schema } from "mongoose";
import ContactData from "../contact/model.js";

const model = {
  message: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: ContactData.name,
    required: true,
  },
};

const name = "MessageReceptor";

/** Schema definition for a message-to-contact recipient relationship. */
export default { model, name };
