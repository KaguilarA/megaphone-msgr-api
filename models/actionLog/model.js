import { Schema } from "mongoose";

/** Schema definition for audit records created by action-log middleware. */
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
