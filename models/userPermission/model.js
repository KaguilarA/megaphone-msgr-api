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

/** Schema definition for a user-to-permission assignment. */
export default { model, name };
