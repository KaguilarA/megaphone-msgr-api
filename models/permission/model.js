import { OwlModel } from "owl-expressjs-utils";

const PermissionData = {
  name: {
    type: String,
    required: [true, "El nombre del permiso es obligatorio."],
    trim: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
};

export default OwlModel("Permission", PermissionData);
