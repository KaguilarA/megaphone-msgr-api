const model = {
  name: {
    type: String,
    required: [true, "El nombre del permiso es obligatorio."],
    trim: true,
    index: true,
  },
  entity: {
    type: String,
    required: [true, "La entidad del permiso es obligatoria."],
    trim: true,
    index: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
};

const name = "Permission";

/** Schema definition for a named application permission. */
export default { model, name }
