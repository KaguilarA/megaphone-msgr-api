export const modelName = "Permission";

/** Schema definition for a named application permission. */
export default {
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
