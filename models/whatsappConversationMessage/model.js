import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import PhoneData from "../phone/model.js";
import UserData from "../user/model.js";

const model = {
  owner: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
  senderPhone: {
    type: Schema.Types.ObjectId,
    ref: PhoneData.name,
    required: true,
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: ContactData.name,
  },
  contactPhone: {
    type: String,
    required: true,
    index: true,
  },
  direction: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true,
  },
  providerMessageId: {
    type: String,
    trim: true,
  },
  text: {
    type: String,
    default: "",
    maxlength: 4096,
  },
  hasMedia: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["received", "accepted", "rejected", "unknown"],
    default: "received",
  },
  autoReplyStatus: {
    type: String,
    enum: ["not_matched", "missing_data", "pending", "accepted", "failed", "unknown"],
    default: "not_matched",
  },
  matchedKeyword: {
    type: String,
    trim: true,
  },
  replyToMessage: {
    type: Schema.Types.ObjectId,
    ref: "WhatsAppConversationMessage",
  },
};

const name = "WhatsAppConversationMessage";
const schema = new Schema(model);
schema.index({ senderPhone: 1, providerMessageId: 1 }, {
  unique: true,
  partialFilterExpression: { providerMessageId: { $type: "string" } },
  name: "unique_waha_provider_message",
});
schema.index({ owner: 1, contactPhone: 1, createdAt: -1 });
schema.index({ owner: 1, createdAt: -1 });

export default { model, name, schema };
