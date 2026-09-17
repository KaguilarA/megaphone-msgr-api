import { Schema } from "mongoose";
import UserData from "../user/model.js";
import StateData from "../state/model.js";

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
  state: [{
    type: Schema.Types.ObjectId,
    ref: StateData.name,
    required: true,
  }],
};

const name = "Message";

/**
 * Schema data for a message with a required sender and state.
 * Recipient relationships are stored separately in `MessageReceptor` documents.
 */
export default { model, name };
