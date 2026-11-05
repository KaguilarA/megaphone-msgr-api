import { Schema } from "mongoose";
import UserData from "../user/model.js";

/**
 * Mongoose schema definition for the Contact model.
 *
 * Represents a contact that is owned by a user.
 */
const model = {
  /**
   * Name of the contact.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  name: {
    type: String,
    required: [true, "El nombre del contacto es obligatorio."],
    trim: true,
  },
  /**
   * Owner of the contact, which is a user.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  owner: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },
  /**
   * State associated with the contact.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};

/**
 * Name of the Contact model.
 *
 * @type {string}
 */
const name = "Contact";

/**
 * Contact model definition.
 *
 * @type {{
 *   model: import("mongoose").SchemaDefinition;
 *   name: string;
 * }}
 */

export default { model, name };
