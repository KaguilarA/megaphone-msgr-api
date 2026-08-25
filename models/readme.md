# Models

The `models` layer defines MongoDB document schemas and exposes them through the `OwlModel` factory from `owl-expressjs-utils`.

## Responsibilities

- Define fields, validation, references, indexes, and defaults.
- Keep persistence concerns separate from HTTP controllers and routes.
- Centralize model instantiation in `models/models.js`.
- Apply password hashing and token encryption through `OwlModel` configuration.

## Model registry

`models/models.js` is the only file that calls `OwlModel`. Individual `model.js` files export schema data and `modelName` metadata.

| Model | Responsibility |
| --- | --- |
| Address | User or contact location with optional coordinates and state. |
| ActionLog | Audit record for a permission-protected action. |
| Contact | User-owned contact identity. |
| Email | Unique email owned by a user or contact. |
| Message | Message content and sender relationship. |
| MessageReceptor | Message-to-contact join record. |
| Permission | Named permission definition. |
| PhoneNumber | Phone number owned by a user or contact. |
| State | Reusable status definition by entity type. |
| Token | Provider credentials owned by a user. |
| User | Account identity and hashed password. |
| UserPermission | User-to-permission join record. |

## Shared model API

Every instantiated model exposes `save`, `getAll`, `getById`, `getOne`, `getByCoincidence`, `update`, and `delete`. Query and persistence behavior is supplied by `owl-expressjs-utils`.

## Relationships

`Email`, `PhoneNumber`, and `Address` use `owner` plus `ownerType` for polymorphic ownership. `MessageReceptor` links messages to contacts. `State` is referenced by several entities. `User` owns contacts, credentials, addresses, tokens, and messages.

## Security behavior

- `User.password` is hashed and omitted from normal JSON output.
- `Token.emailToken`, `Token.whatsappToken`, and `Token.telegramToken` are encrypted.
- Models do not perform HTTP authorization; middleware and controllers own that responsibility.

## Related files

- `models/models.js`: central model registry.
- `config.js`: injects instantiated models into routes.
- `controllers/`: application behavior around persistence.
- `routes/`: HTTP boundaries and middleware.
