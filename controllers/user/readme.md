# User controller

## Overview

`UserController` exposes registration and authenticated-account operations for `User`
documents. Unlike other entity controllers, it is created directly by
[`OwlModel`'s companion factory pattern](../readme.md#common-patterns) as a plain object of
bound functions rather than a class instance.

The controller is created through a factory function:

```js
export default ({ entityId, model, populatedFields }) => ({ getInfo, register, update });
```

## Responsibilities

- Register a new user account.
- Return the authenticated user's own account information, with optional population of related fields.
- Update the authenticated user's own account information.

All read/update operations are scoped to `req.session.userId`; a user can never read or modify
another account through this controller.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `register` | `POST /user` | Creates a new user document from the request body. |
| `getInfo` | `GET /user` | Returns the authenticated user's document, populated with `populatedFields`. Responds `404` if there is no session or the user cannot be found. |
| `update` | `PUT /user` | Updates the authenticated user's document and returns the populated result. Responds `404` if the user cannot be found. |

## Error handling

- `register` responds `400` with `{ message, error }` when creation fails (e.g. validation errors).
- `getInfo` and `update` respond `500` with `{ message, error }` on unexpected failures, and `404` with `{ message }` when the user does not exist or is not authenticated.

## Related files

- `controllers/user/user.js`: implementation.
- `routes/user/routes.js`: route bindings; `register` is public, `getInfo` and `update` are protected by `OwlIsAuth`.
- [User model](../../models/user/readme.md): schema, password hashing, and related resources.
- [Auth controller](../auth/readme.md): login, logout, and session status.
