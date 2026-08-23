# Auth controller

## Overview

`AuthController` handles credential-based login, logout, and session status for `User`
accounts. It resolves the user's email through the `Email` model and validates the password
hash stored on the `User` model, then establishes an `express-session` on success.

The controller is created through a factory function:

```js
export default ({ id, models: [{ model: userModel }, { model: emailModel }] }) =>
  new AuthController(id, userModel, emailModel);
```

## Responsibilities

- Look up the login email in the `Email` model, scoped to `ownerType: "User"`.
- Load the owning `User` document and compare the submitted password against the stored hash.
- Start an authenticated session by setting `req.session.userId`.
- Destroy the session and clear the session cookie on logout.
- Report whether the current request is authenticated.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `logIn` | `POST /auth/login` | Validates `email` and `password`, then creates a session for the matching user. |
| `logout` | `POST /auth/logout` | Destroys the session and clears the `connect.sid` cookie. |
| `status` | `GET /auth/status` | Returns `{ authenticated: boolean, user? }` based on the current session/request user. |

## Login flow

1. Reject the request with `400` if `email` or `password` is missing.
2. Look up the email document (`ownerType: "User"`); respond `401` if not found.
3. Load the `User` by the email's `owner` ID; respond `401` if not found.
4. Compare the submitted password against the hashed `password` field with `compareHash`; respond `401` on mismatch.
5. Save `req.session.userId` and respond `200` with the user document (password excluded via `OwlModel`).

## Error handling

Unexpected errors are logged and answered with `500` and a generic error message. Expected
authentication failures always respond `401` without revealing whether the email or the
password was incorrect.

## Related files

- `controllers/auth/controller.js`: implementation.
- `routes/auth/routes.js`: route bindings (public, no `OwlIsAuth`).
- `models/user/model.js`: user schema and password hashing/compare support.
- `models/email/model.js`: email lookup used to resolve the owning user.
