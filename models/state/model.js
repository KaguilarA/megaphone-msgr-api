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
 * State model definition using the OwlModel factory.
 * Handles structural properties for categorical state tracking across different entities.
 */
/** Schema definition for reusable entity status values. */
export default { model, name };
