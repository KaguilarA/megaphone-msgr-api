import { Schema } from "mongoose";
import UserData from "../user/model.js";
import PermissionData from "../permission/model.js";

const model = {
  user: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
  permission: {
    type: Schema.Types.ObjectId,
    ref: PermissionData.name,
    required: true,
    index: true,
  },
};

const name = "UserPermission";
const schema = new Schema(model);
schema.index({ user: 1, permission: 1 }, { unique: true, name: "unique_user_permission" });

/**
 * Schema data for one assignment between a user and a permission.
 * Authorization middleware uses both references when resolving permissions.
 */
export default { model, name, schema };
