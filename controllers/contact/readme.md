# Contact controller

## Overview

`ContactController` manages `Contact` documents owned by the authenticated `User`. All reads
are scoped to `req.user.id`, and every created contact is stamped with the current user as its
`owner`.

The controller is created through a factory function:

```js
export default ({ id, model }) => new ContactController(id, model);
```

## Responsibilities

- Read a single contact by ID.
- List every contact owned by the authenticated user.
- Create a contact for the authenticated user.
- Update and delete a contact by ID.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `getAll` | `GET /contact` | Returns all contacts where `owner` is the authenticated user. |
| `getById` | `GET /contact/:id` | Returns a single contact by ID, or `404` if missing. |
| `register` | `POST /contact` | Creates a contact owned by the authenticated user. |
| `update` | `PUT /contact/:id` | Updates a contact by ID, or `404` if missing. |
| `delete` | `DELETE /contact/:id` | Deletes a contact by ID. |

## Error handling

All methods respond with `500` and `{ error: message }` for unexpected failures. `getById` and
`update` respond with `404` and `{ message: "Contact not found." }` when the contact does not
exist.

## Related files

- `controllers/contact/controller.js`: implementation.
- `routes/contact/routes.js`: route bindings, all protected by `OwlIsAuth`.
- [Contact model](../../models/contact/readme.md): schema and validation rules.
- Related child resources: [Address](../address/readme.md), [Email](../email/readme.md), [Phone](../phone/readme.md), each scoped by `ownerType: "Contact"`.
