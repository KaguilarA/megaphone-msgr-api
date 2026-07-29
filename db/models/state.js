import AmpApiModel from "./../utils/model.js";

/**
 * State model definition using the AmpApiModel factory.
 * Handles structural properties for categorical state tracking across different entities.
 */
export default AmpApiModel("State", {
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
