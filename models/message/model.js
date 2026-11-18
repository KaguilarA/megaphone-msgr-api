import { Schema } from "mongoose";
import PhoneData from "../phone/model.js";
import UserData from "../user/model.js";

const model = {
  requestId: { type: String },
  senderMode: { type: String, enum: ["single", "round-robin"], default: "single" },
  channel: { type: String, enum: ["whatsapp", "email"], default: "whatsapp", index: true },
  deliveryStatus: { type: String, enum: ["pending", "sending", "accepted", "partial", "failed"], default: "pending" },
  deliveries: [{
    recipient: String,
    senderPhone: { type: Schema.Types.ObjectId, ref: PhoneData.name },
    status: { type: String, enum: ["pending", "sending", "accepted", "rejected", "unknown"], default: "pending" },
    providerMessageId: String,
  }],
  content: {
    type: String,
    trim: true,
    default: "",
  },
  mediaUrl: {
    type: String,
    trim: true,
  },
  header: {
    type: String,
    trim: true,
    default: "",
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
  },
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: "Contact",
  }],
  senderPhone: {
    type: Schema.Types.ObjectId,
    ref: PhoneData.name,
    index: true,
  },
  senderEmail: {
    type: String,
    trim: true,
  },
  hiddenAt: {
    type: Date,
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
const schema = new Schema(model);
schema.index({ sender: 1, requestId: 1 }, {
  unique: true,
  partialFilterExpression: { requestId: { $type: "string" } },
  name: "unique_sender_request",
});
schema.index({ sender: 1, hiddenAt: 1, createdAt: -1 }, {
  name: "message_history_owner_visible",
});

/**
 * Schema data for a message with a required sender and contact IDs.
 * Per-recipient delivery results are stored in the `deliveries` array.
 */
export default { model, name, schema };
