import { Schema } from "mongoose";
import ContactData from "../contact/model.js";
import UserData from "../user/model.js";

/**
 * Array of possible owner types for the Address model.
 *
 * @type {string[]}
 */
const OwnerTypes = [UserData.name, ContactData.name];

/**
 * Mongoose schema definition for the Address model.
 *
 * Represents a physical address that can be owned by either a user or a contact.
 */
const model = {
  /**
   * Street address.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  street: {
    type: String,
    trim: true,
  },
  /**
   * City of the address.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  city: {
    type: String,
    trim: true,
  },
  /**
   * Postal code of the address.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  postalCode: {
    type: String,
    trim: true,
  },
  /**
   * Country of the address.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  country: {
    type: String,
    trim: true,
  },
  /**
   * Latitude coordinate of the address.
   * @type {import("mongoose").SchemaDefinitionProperty<number>}
   */
  latitude: {
    type: Number,
    min: -90,
    max: 90,
  },
  /**
   * Longitude coordinate of the address.
   * @type {import("mongoose").SchemaDefinitionProperty<number>}
   */
  longitude: {
    type: Number,
    min: -180,
    max: 180,
  },
  /**
   * Owner of the address, which can be either a user or a contact.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "ownerType",
    index: true,
  },
  /**
   * Type of the owner, determining the referenced model for the `owner` field.
   * @type {import("mongoose").SchemaDefinitionProperty<string>}
   */
  ownerType: {
    type: String,
    required: true,
    enum: OwnerTypes,
  },
  /**
   * State associated with the address.
   * @type {import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId>}
   */
  state: {
    type: Schema.Types.ObjectId,
    ref: "State",
  },
};

/**
 * Name of the Address model.
 *
 * @type {string}
 */
const name = "Address";

/**
 * Address model definition.
 *
 * @type {{
 *   model: import("mongoose").SchemaDefinition;
 *   name: string;
 * }}
 */
export default { model, name };