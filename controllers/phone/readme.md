# Phone controller

## Overview

`PhoneController` manages `PhoneNumber` documents owned either by the authenticated `User` or by
one of their `Contact` entries. It relies on the polymorphic `owner` / `ownerType` fields
defined in the [PhoneNumber model](../../models/phone/readme.md).

The controller is created through a factory function:

```js
export default ({ id, model }) => new PhoneController(id, model);
```

## Responsibilities

- Read a single phone number by ID.
- List phone numbers owned by the authenticated user.
- List phone numbers owned by a specific contact.
- Create a phone number for the authenticated user or for a specific contact.
- Update and delete a phone number by ID.

Ownership assignment (`owner`, `ownerType`) is set by the controller from the session or route
parameter; it is never trusted from the request body.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `getUserPhoneNumber` | `GET /phone-number` | Returns all phone numbers where `owner` is the authenticated user and `ownerType` is `"User"`. |
| `getById` | `GET /phone-number/:id` | Returns a single phone number by ID, or `404` if missing. |
| `getContactPhoneNumber` | `GET /phone-number/:id/contact` | Returns all phone numbers where `owner` is the given contact ID and `ownerType` is `"Contact"`. |
| `registerUserPhoneNumber` | `POST /phone-number` | Creates a phone number owned by the authenticated user. |
| `registerContactPhoneNumber` | `POST /phone-number/contact` | Creates a phone number owned by the given contact ID (from route data). |
| `update` | `PUT /phone-number/:id` | Updates a phone number by ID, or `404` if missing. |
| `delete` | `DELETE /phone-number/:id` | Deletes a phone number by ID. |

## Error handling

All methods respond with `500` and `{ error: message }` for unexpected failures. `getById` and
`update` respond with `404` and `{ message: "Phone number not found." }` when the phone number
does not exist.

## Related files

- `controllers/phone/controller.js`: implementation.
- `routes/phone/routes.js`: route bindings; `registerUserPhoneNumber` is public, the rest are protected by `OwlIsAuth`.
- [PhoneNumber model](../../models/phone/readme.md): schema and validation rules.
