# Address controller

## Overview

`AddressController` manages `Address` documents owned either by the authenticated `User` or by
one of their `Contact` entries. It relies on the polymorphic `owner` / `ownerType` fields
defined in the [Address model](../../models/address/readme.md).

The controller is created through a factory function:

```js
export default ({ id, model }) => new AddressController(id, model);
```

## Responsibilities

- Read a single address by ID.
- List addresses owned by the authenticated user.
- List addresses owned by a specific contact.
- Create an address for the authenticated user or for a specific contact.
- Update and delete an address by ID.

Ownership assignment (`owner`, `ownerType`) is set by the controller from the session or route
parameter; it is never trusted from the request body.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `getUserAddresses` | `GET /address` | Returns all addresses where `owner` is the authenticated user and `ownerType` is `"User"`. |
| `getAddressById` | `GET /address/:id` | Returns a single address by ID, or `404` if missing. |
| `getContactAddresses` | `GET /address/:id/contact` | Returns all addresses where `owner` is the given contact ID and `ownerType` is `"Contact"`. |
| `registerUserAddress` | `POST /address` | Creates an address owned by the authenticated user. |
| `registerContactAddress` | `POST /address/:id/contact` | Creates an address owned by the given contact ID. |
| `updateAddress` | `PUT /address/:id` | Updates an address by ID, or `404` if missing. |
| `deleteAddress` | `DELETE /address/:id` | Deletes an address by ID. |

## Error handling

All methods respond with `500` and `{ error: message }` for unexpected failures. `getAddressById`
and `updateAddress` respond with `404` and `{ message: "Address not found." }` when the address
does not exist.

## Related files

- `controllers/address/controller.js`: implementation.
- `routes/address/routes.js`: route bindings, all protected by `OwlIsAuth`.
- [Address model](../../models/address/readme.md): schema and validation rules.
