import { OwlModel } from "owl-expressjs-utils";

/**
 * State model definition using the OwlModel factory.
 * Handles structural properties for categorical state tracking across different entities.
 */
export default OwlModel("State", {
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: [
    {
      type: String,
      enum: ["address", "user", "contact", "email", "phoneNumber"],
      required: true,
    },
  ],
});
