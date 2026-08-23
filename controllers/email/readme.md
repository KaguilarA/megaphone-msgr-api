# Email controller

## Overview

`EmailController` manages `Email` documents owned either by the authenticated `User` or by one
of their `Contact` entries. It relies on the polymorphic `owner` / `ownerType` fields defined in
the [Email model](../../models/email/readme.md).

The controller is created through a factory function:

```js
export default ({ id, model }) => new EmailController(id, model);
```

## Responsibilities

- Read a single email by ID.
- List emails owned by the authenticated user.
- List emails owned by a specific contact.
- Create an email for the authenticated user or for a specific contact.
- Update and delete an email by ID.

Ownership assignment (`owner`, `ownerType`) is set by the controller from the session or route
parameter; it is never trusted from the request body.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `getUserEmail` | `GET /email` | Returns all emails where `owner` is the authenticated user and `ownerType` is `"User"`. |
| `getById` | `GET /email/:id` | Returns a single email by ID, or `404` if missing. |
| `getContactEmail` | `GET /email/:id/contact` | Returns all emails where `owner` is the given contact ID and `ownerType` is `"Contact"`. |
| `registerUserEmail` | `POST /email` | Creates an email owned by the authenticated user. |
| `registerContactEmail` | `POST /email/contact` | Creates an email owned by the given contact ID (from route data). |
| `update` | `PUT /email/:id` | Updates an email by ID, or `404` if missing. |
| `delete` | `DELETE /email/:id` | Deletes an email by ID. |

## Error handling

All methods respond with `500` and `{ error: message }` for unexpected failures. `getById` and
`update` respond with `404` and `{ message: "Email not found." }` when the email does not
exist.

## Related files

- `controllers/email/controller.js`: implementation.
- `routes/email/routes.js`: route bindings; `registerUserEmail` is public, the rest are protected by `OwlIsAuth`.
- [Email model](../../models/email/readme.md): schema and validation rules.
