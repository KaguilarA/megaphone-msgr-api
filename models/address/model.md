# Address model

## Overview

`Address` represents a physical or geographic address associated with an application owner.
An address can belong to either a `User` or a `Contact`. The model uses a polymorphic
relationship: `owner` stores the MongoDB identifier and `ownerType` tells Mongoose which
collection must be used to resolve that identifier.

The model is created through the `OwlModel` factory:

```js
OwlModel("Address", schemaDefinition)
```

This makes the model part of the common `owl-expressjs-utils` model API, including operations
such as `save`, `getById`, `getByCoincidence`, `update`, and `delete`.

## Responsibilities

- Store street, city, postal code, and country information.
- Store optional geographic coordinates.
- Associate the address with a `User` or `Contact`.
- Associate the address with an optional `State` document.
- Support indexed owner lookups through `owner`.

The model does not geocode addresses, validate whether a postal code exists in a country, or
verify that coordinates describe the supplied textual address. Those concerns belong to the
application or an external geographic service.

## Document structure

```mermaid
classDiagram
		class Address {
				ObjectId _id
				String street
				String city
				String postalCode
				String country
				Number latitude
				Number longitude
				ObjectId owner
				String ownerType
				ObjectId state
		}

		Address "many" --> "1" User : owner when ownerType = User
		Address "many" --> "1" Contact : owner when ownerType = Contact
		Address "many" --> "0..1" State : state
```

## Fields

| Field | Mongo/Mongoose type | Required | Rules and meaning |
| --- | --- | --- | --- |
| `_id` | `ObjectId` | Generated | MongoDB identifier generated for the address. |
| `street` | `String` | No | Street and house/building information. Leading and trailing whitespace is removed with `trim`. |
| `city` | `String` | No | City or locality. Whitespace is trimmed. |
| `postalCode` | `String` | No | Postal or ZIP code. It remains a string so leading zeroes are preserved. Whitespace is trimmed. |
| `country` | `String` | No | Country name or code supplied by the client. Whitespace is trimmed. No country enum is enforced here. |
| `latitude` | `Number` | No | Latitude in the inclusive range `-90` to `90`. |
| `longitude` | `Number` | No | Longitude in the inclusive range `-180` to `180`. |
| `owner` | `ObjectId` | Yes | Identifier of the owning `User` or `Contact`. It has an index for efficient owner queries. |
| `ownerType` | `String` | Yes | Discriminator for `owner`; only `User` or `Contact` is accepted. |
| `state` | `ObjectId` | No | Reference to a `State` document. The reference is optional. |

### Coordinate rules

- `latitude` must be between `-90` and `90`.
- `longitude` must be between `-180` and `180`.
- Supplying only one coordinate is allowed by the schema.
- No precision or coordinate reference system is enforced beyond the numeric ranges.

## Polymorphic ownership

`owner` and `ownerType` must be treated as a pair:

```js
{
	owner: "665f1a000000000000000001",
	ownerType: "Contact"
}
```

When `ownerType` is `User`, `owner` points to the `User` collection. When `ownerType` is
`Contact`, it points to the `Contact` collection. The `refPath: "ownerType"` configuration
enables this dynamic reference.

```mermaid
flowchart LR
		A[Address document] --> B{ownerType}
		B -->|User| C[User._id]
		B -->|Contact| D[Contact._id]
		A --> E[state]
		E --> F[State._id optional]
```

Consumers must not interpret `owner` alone. They must always use `ownerType` to determine the
target collection.

## State relationship

The `state` field is a normal MongoDB reference to the `State` model:

```js
state: {
	type: Schema.Types.ObjectId,
	ref: "State",
}
```

This keeps state data separate from every address document. The `Address` schema does not
restrict state names; that policy belongs to the `State` model and the calling feature.

## Validation and limitations

- `owner` and `ownerType` are the only required address fields.
- `ownerType` rejects values other than `User` and `Contact`.
- Text fields are trimmed but are not required and have no maximum length in this schema.
- Coordinates reject values outside their geographic ranges.
- `state` is optional.
- The schema does not enforce that the referenced `owner` document exists.
- The schema does not enforce that the referenced `state` document exists.
- Authorization is provided by route middleware and controllers, not by the model itself.

## Related files

- `models/address/model.js`: schema and model definition.
- `routes/address.js`: authenticated CRUD routes.
- `config.js`: registers the model at `/address`.
- `controllers/user.js`: creates and loads addresses belonging to users.
- `controllers/contact.js`: creates and loads addresses belonging to contacts.
- `models/state/model.js`: referenced state model.
