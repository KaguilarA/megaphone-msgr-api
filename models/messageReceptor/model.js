import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const MessageReceptorData = {
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
};

export default OwlModel("MessageReceptor", MessageReceptorData);
