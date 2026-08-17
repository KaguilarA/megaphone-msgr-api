# Email model

## Overview

`Email` stores one email address and associates it with either a `User` or a `Contact`.
It is a separate resource rather than an embedded field so the same ownership pattern can be
used for user emails and contact emails.

The model is created through the `OwlModel` factory:

```js
OwlModel("Email", schemaDefinition)
```

This provides the common `owl-expressjs-utils` model operations, including `save`, `getById`,
`getOne`, `getByCoincidence`, `update`, and `delete`.

## Responsibilities

- Store a normalized email address.
- Validate the basic email format.
- Enforce uniqueness of the email value in the collection.
- Associate the email with a `User` or `Contact` through a polymorphic owner reference.
- Optionally associate the email with a `State` document.

The model does not verify mailbox ownership, send a confirmation message, or guarantee that the
mailbox exists. Those operations belong to application services outside this schema.

## Document structure

```mermaid
classDiagram
		class Email {
				ObjectId _id
				String email
				ObjectId owner
				String ownerType
				ObjectId state
		}

		Email "many" --> "1" User : owner when ownerType = User
		Email "many" --> "1" Contact : owner when ownerType = Contact
		Email "many" --> "0..1" State : state
```

## Fields

| Field | Mongo/Mongoose type | Required | Rules and meaning |
| --- | --- | --- | --- |
| `_id` | `ObjectId` | Generated | MongoDB identifier generated for the email document. |
| `email` | `String` | Yes | Email value. It is trimmed, converted to lowercase, validated by regex, and marked unique. |
| `owner` | `ObjectId` | Yes | Identifier of the owning `User` or `Contact`. It has an index for owner lookups. |
| `ownerType` | `String` | Yes | Dynamic reference discriminator; only `User` or `Contact` is accepted. |
| `state` | `ObjectId` | No | Optional reference to a `State` document. |

## Email normalization and validation

The `email` field uses the following Mongoose options:

```js
{
	required: [true, "El correo electrónico es obligatorio."],
	unique: true,
	trim: true,
	lowercase: true,
	match: [/^\S+@\S+\.\S+$/, "El formato del correo electrónico no es válido."],
}
```

The practical processing order is:

1. Leading and trailing whitespace is removed.
2. The value is converted to lowercase.
3. The value must match the basic `local-part@domain.tld` pattern.
4. MongoDB uniqueness prevents duplicate stored values when the unique index is present.

For example, ` Ana@Example.COM ` is stored as `ana@example.com`.

The regular expression is intentionally basic. It is not a complete implementation of every
format permitted by the email standards, and it does not validate DNS or mailbox existence.

```mermaid
flowchart LR
		A[Input email] --> B[trim]
		B --> C[lowercase]
		C --> D{Matches basic email pattern?}
		D -->|No| E[Validation error]
		D -->|Yes| F{Unique in collection?}
		F -->|No| G[Duplicate key error]
		F -->|Yes| H[Save normalized email]
```

## Polymorphic ownership

`owner` and `ownerType` must be used together:

```js
{
	owner: "665f1a000000000000000001",
	ownerType: "Contact"
}
```

The `refPath: "ownerType"` setting resolves `owner` against `User` when
`ownerType` is `User`, or against `Contact` when it is `Contact`.

```mermaid
flowchart TD
		E[Email document] --> T{ownerType}
		T -->|User| U[User._id]
		T -->|Contact| C[Contact._id]
		E --> S[state]
		S --> ST[State._id optional]
```

The schema does not guarantee that the referenced owner exists. Ownership and authorization
must be checked by the relevant controller.

## State relationship

`state` is an optional reference to `State`:

```js
state: {
	type: Schema.Types.ObjectId,
	ref: "State",
}
```

The `Email` model does not define which state names are valid. That policy is owned by the
`State` model and the feature assigning the state.

## API usage

The model is registered at `/email`. Its router allows registration before authentication is
applied, then protects listing, reading, updating, and deleting:

| Method | Endpoint | Authentication in router | Purpose |
| --- | --- | --- | --- |
| `POST` | `/email` | Not enforced by this router | Create an email document. |
| `GET` | `/email` | Required | List email documents. |
| `GET` | `/email/:id` | Required | Retrieve one email. |
| `PUT` | `/email/:id` | Required | Update one email. |
| `DELETE` | `/email/:id` | Required | Delete one email. |

The route-level authentication behavior is distinct from model validation. A request can still
fail because `email`, `owner`, or `ownerType` is invalid or missing.

### Standalone creation

```json
{
	"email": "ana@example.com",
	"owner": "665f1a000000000000000001",
	"ownerType": "Contact",
	"state": "665f1a000000000000000010"
}
```

### Nested creation through a contact

The contact controller accepts email strings in the `emails` array and assigns ownership on
the server:

```json
{
	"name": "Ana Lopez",
	"emails": [
		"ana@example.com"
	]
}
```

The resulting email document receives:

```js
{
	email: "ana@example.com",
	owner: contact._id,
	ownerType: "Contact",
}
```

### Nested creation through a user

When a user is registered, the optional `email` object is saved with the new user's identifier
and `ownerType: "User"`:

```json
{
	"name": "Ana",
	"lastname": "Lopez",
	"email": {
		"email": "ana@example.com"
	}
}
```

## Relationship lifecycle

Emails created as children of a contact are deleted when that contact is deleted. This cascade
is implemented by `controllers/contact.js`, which finds child emails by `owner` and
`ownerType: "Contact"` before deleting them. It is not implemented by the `Email` schema.

```mermaid
sequenceDiagram
		participant Client
		participant ContactController
		participant EmailModel
		participant MongoDB

		Client->>ContactController: DELETE /contact/:id
		ContactController->>EmailModel: Find emails by owner and ownerType
		EmailModel->>MongoDB: Query child emails
		MongoDB-->>EmailModel: Matching emails
		ContactController->>EmailModel: Delete each child email
		EmailModel->>MongoDB: Delete email documents
		ContactController-->>Client: Contact deletion response
```

## Validation and limitations

- `email`, `owner`, and `ownerType` are required.
- Email values are trimmed and lowercased before persistence.
- The format check is basic and does not verify DNS or mailbox existence.
- `unique: true` relies on a MongoDB unique index; duplicate writes can still surface as database errors.
- `ownerType` accepts only `User` and `Contact`.
- The schema does not enforce that `owner` or `state` references an existing document.
- Authentication and authorization are route/controller concerns, not model concerns.

## Related files

- `models/email/email.js`: schema and model definition.
- `routes/email.js`: email CRUD routes and authentication boundary.
- `config.js`: registers the model at `/email`.
- `controllers/contact.js`: creates, loads, and removes contact-owned emails.
- `controllers/user.js`: creates user-owned emails during registration.
- `models/state.js`: referenced state model.
