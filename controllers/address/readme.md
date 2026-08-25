# Address Controller

## Responsibility

Coordinates address operations for authenticated users and contacts.

## Public methods

- `getUserAddresses`: lists addresses with `ownerType: "User"` for `req.session.userId`.
- `getContactAddresses`: lists addresses for the contact ID in `req.params.id`.
- `getAddressById`: returns one address by ID.
- `registerUserAddress`: saves an address owned by the current user.
- `registerContactAddress`: saves an address owned by the route contact ID.
- `updateAddress`: updates an address by ID.
- `deleteAddress`: deletes an address by ID.

## Dependencies

The factory accepts `{ id, model }`. `model` is the instantiated `AddressModel`.

## Limitations

ID-based read, update, and delete operations are not owner-scoped in this controller. Authentication is supplied by the router.
