const Supported = ["Address", "User", "Contact", "Email", "Phone"];

const model = {
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  entity: {
    type: String,
    enum: Supported,
    required: true,
  },
};

const name = "State"

/**
 * Schema data for a reusable status value.
 * `entity` restricts the status to Address, User, Contact, Email, or Phone records.
 */
export default { model, name };
