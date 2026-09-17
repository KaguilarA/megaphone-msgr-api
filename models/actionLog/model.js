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
  action: {
    type: String,
    required: [true, "La acción es obligatoria."],
    trim: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
};

const name = "ActionLog";

/**
 * Schema data for audit records created by permission-aware requests.
 * The action-log middleware owns record creation; this object only defines persistence fields.
 */
export default { model, name };
