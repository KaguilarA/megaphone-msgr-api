import { Schema } from "mongoose";

import UserData from "../user/model.js";

import PermissionData from "../permission/model.js";

/**
 * Mongoose schema definition for the ActionLog model.
 *
 * Stores a record of an action performed by a user, including
 * the associated permission and additional contextual metadata.
 */
const model = {
  /**
   * User who performed the action.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: UserData.name,
    required: true,
    index: true,
  },

  /**
   * Permission associated with the action.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  permission: {
    type: Schema.Types.ObjectId,
    ref: PermissionData.name,
    required: true,
    index: true,
  },

  /**
   * Name or identifier of the action that was performed.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  action: {
    type: String,
    required: [true, "La acción es obligatoria."],
    trim: true,
  },

  /**
   * Additional contextual information associated with the action.
   * @type {import("mongoose").SchemaDefinitionProperty<object>}
   */
  metadata: {
    type: Object,
    default: {},
  },
};

/**
 * Name of the ActionLog model.
 *
 * @type {string}
 */
const name = "ActionLog";

/**
 * ActionLog model definition.
 *
 * @type {{
 *   model: import("mongoose").SchemaDefinition;
 *   name: string;
 * }}
 */
export default { model, name };