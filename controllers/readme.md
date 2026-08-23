# Controllers

## Overview

The `controllers` layer implements the request handlers used by the Express routes. Each
controller receives its dependencies (models, entity identifiers, related models) through a
factory function invoked from `config.js`, and exposes bound methods consumed by the matching
router in `routes`.

This file is a general index. Each controller has its own documentation page describing its
responsibilities, methods, and request/response contract.

## Controller navigation

| Controller | Purpose | Documentation |
| --- | --- | --- |
| `AddressController` | CRUD for addresses owned by a user or a contact. | [Address controller](address/readme.md) |
| `AuthController` | Login, logout, and session status. | [Auth controller](auth/readme.md) |
| `ContactController` | CRUD for contacts owned by the authenticated user. | [Contact controller](contact/readme.md) |
| `CountriesController` | Read-only list of supported countries and dial codes. | [Countries controller](countries/readme.md) |
| `EmailController` | CRUD for emails owned by a user or a contact. | [Email controller](email/readme.md) |
| `MessageController` | CRUD for messages and their recipient contacts (MessageReceptor). | [Message controller](message/readme.md) |
| `PhoneController` | CRUD for phone numbers owned by a user or a contact. | [Phone controller](phone/readme.md) |
| `UserController` | Authenticated account read/update and registration. | [User controller](user/user.md) |

## Common patterns

- Each controller is created by a factory function: `export default (config) => new Controller(...)`.
- `config.js` supplies the dependencies (`model`, `receptorModel`, `contactModel`, `populatedFields`, etc.) that the factory forwards to the controller instance.
- Routes call `.bind(controller)` on each handler before registering it.
- Every handler follows the same error-handling shape: a `try/catch` block that returns `500` with `{ error: message }` on unexpected failures, and a specific `4xx` status for expected not-found or validation cases.
- Ownership scoping (`req.session.userId` or `req.user`) is enforced in the controller, not in the model.

## Out of scope

Sending messages through an external provider (WhatsApp, Telegram, etc.) is intentionally not
implemented in `MessageController`. That integration will be added later as a separate,
dedicated module.

## Related files

- `config.js`: wires each controller factory to its route and dependencies.
- `models/readme.md`: documents the data layer consumed by these controllers.
- `routes`: Express routers that bind controller methods to HTTP endpoints.
