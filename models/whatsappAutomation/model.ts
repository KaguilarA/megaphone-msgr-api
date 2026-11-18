import { Schema, type SchemaDefinition } from "mongoose";
import UserData from "../user/model.js";

const ruleSchema = new Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  response: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4096,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

const model: SchemaDefinition = {
  owner: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  rules: [ruleSchema],
};

const name = "WhatsAppAutomation";
const schema = new Schema(model);
schema.index({ owner: 1 }, { unique: true, name: "unique_whatsapp_automation_owner" });

export default { model, name, schema };
