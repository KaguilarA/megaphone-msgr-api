import { OwlModel } from "owl-expressjs-utils";

const stateSupported = ["address", "user", "contact", "email", "phoneNumber"];

const StateData = {
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
    enum: stateSupported,
    required: true,
  },
};

/**
 * State model definition using the OwlModel factory.
 * Handles structural properties for categorical state tracking across different entities.
 */
export default OwlModel("State", StateData);
