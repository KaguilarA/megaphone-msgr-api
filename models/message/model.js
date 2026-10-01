import { Schema } from "mongoose";
import PhoneData from "../phone/model.js";
import UserData from "../user/model.js";

const model = {
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
    ref: UserData.name,
    required: true,
  },
  senderPhone: {
    type: Schema.Types.ObjectId,
    ref: PhoneData.name,
    required: true,
    index: true,
  },
  media: {
    type: {
      type: String,
      enum: ["image", "video"],
    },
    url: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    bytes: {
      type: Number,
    },
  },
  state: [
    {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  ],
};

const name = "Message";

/**
 * Schema data for a message with a required sender and state.
 * Recipient relationships are stored separately in `MessageReceptor` documents.
 */
export default { model, name };
