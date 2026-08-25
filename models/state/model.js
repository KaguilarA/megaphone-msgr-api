const Supported = ["address", "user", "contact", "email", "phoneNumber"];

export const modelName = "State";

/**
 * State model definition using the OwlModel factory.
 * Handles structural properties for categorical state tracking across different entities.
 */
/** Schema definition for reusable entity status values. */
export default {
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: Supported,
    required: true,
  },
};;
