import { Schema } from "mongoose";

/**
 * Schema data for audit records created by permission-aware requests.
 * The action-log middleware owns record creation; this object only defines persistence fields.
 */
export default {
  name: "ActionLog",
  model: {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    permission: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, "La acción es obligatoria."],
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
};
