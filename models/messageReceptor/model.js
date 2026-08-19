import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

export default OwlModel("MessageReceptor", {
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
});
