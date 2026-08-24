import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const UserPermissionData = {
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

export default OwlModel("UserPermission", UserPermissionData);
