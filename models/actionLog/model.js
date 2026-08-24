import { Schema } from "mongoose";
import { OwlModel } from "owl-expressjs-utils";

const ActionLogData = {
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
};

export default OwlModel("ActionLog", ActionLogData);
