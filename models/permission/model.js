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

/**
 * Schema data for a named permission and the entity it protects.
 * Permission assignment and request authorization are handled outside the model.
 */
export default { model, name }
