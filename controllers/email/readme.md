# Email Controller

## Responsibility

Coordinates email operations for users and contacts.

## Public methods

- `getUserEmail`: lists emails owned by the current user.
- `getContactEmail`: lists emails owned by a contact ID.
- `getById`: returns one email by ID.
- `registerUserEmail`: creates an email owned by the current user.
- `registerContactEmail`: creates an email owned by a contact ID.
- `update`: updates an email by ID.
- `delete`: deletes an email by ID.

## Dependencies

The factory accepts `{ id, model }`, where `model` is `EmailModel`.

## Route boundary

The current root `POST /email` route is public. Other email routes are protected by `OwlIsAuth`.
