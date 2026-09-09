# Models

The `models` layer defines MongoDB document schemas and exposes them through the `OwlModel` factory from `owl-expressjs-utils`.

## Responsibilities

- Define fields, validation, references, indexes, and defaults.
- Keep persistence concerns separate from HTTP controllers and routes.
- Centralize model instantiation in `models/models.js`.
- Apply password hashing and token encryption through `OwlModel` configuration.

## Model registry

`models/models.js` is the only file that calls `OwlModel`. Individual `model.js` files export an object with `name` and `model`; `tokens/model.js` and `user/model.js` also export the field-security configuration consumed by the registry.

| Model | Responsibility |
| --- | --- |
| Address | User or contact location with optional coordinates and state. |
| ActionLog | Audit record for a permission-protected action. |
| Contact | User-owned contact identity. |
| Email | Unique email owned by a user or contact. |
| Message | Message content and sender relationship. |
| MessageReceptor | Message-to-contact join record. |
| Permission | Named permission definition. |
| Phone | Phone number owned by a user or contact. The registered model name is `Phone`; the registry export is `PhoneNumberModel`. |
| State | Reusable status definition by entity type. |
| Token | Provider credentials owned by a user. The registered model name is `Token`; the registry export is `TokenModel`. |
| User | Account identity and hashed password. |
| UserPermission | User-to-permission join record. |

## Shared model API

Every model created by `OwlModel` exposes `save`, `getAll`, `getById`, `getOne`, `getByCoincidence`, `update`, and `delete`; hash-configured models also expose `compareHash`. Query and persistence behavior is supplied by `owl-expressjs-utils`.

## Relationships

`Email`, `Phone`, and `Address` use `owner` plus `ownerType` for polymorphic ownership. `MessageReceptor` links messages to contacts. `State` is referenced by several entities. `User` owns contacts, credentials, addresses, tokens, and messages.

## Security behavior

- `User.password` is hashed and omitted from normal JSON output.
- `Token.emailToken`, `Token.whatsappToken`, and `Token.telegramToken` are encrypted.
- Models do not perform HTTP authorization; middleware and controllers own that responsibility.

## Related files

- `models/models.js`: central model registry.
- `consts/config.js`: injects instantiated models into route configuration.
- `controllers/`: application behavior around persistence.
- `routes/`: HTTP boundaries and middleware.
