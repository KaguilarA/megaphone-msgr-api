import { Schema } from "mongoose";

export const modelName = "UserPermission";

export default {
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
};
