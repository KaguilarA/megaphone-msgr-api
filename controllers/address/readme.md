# Address Controller

## Responsibility

Coordinates address operations for authenticated users and contacts.

## Public methods

- `getDataFromUser`: lists data with `ownerType: "User"` for `req.session.userId`.
- `getDataFromContact`: lists data for the contact ID in `req.params.id`.
- `getDataById`: returns data by ID.
- `registerForUser`: saves data owned by the current user.
- `registerForContact`: saves data owned by the route contact ID.
- `updateDataById`: updates data by ID.
- `deleteDataById`: deletes data by ID.

## Dependencies

The factory accepts `{ id, model }`. `model` is the instantiated `AddressModel`.

## Limitations

ID-based read, update, and delete operations are not owner-scoped in this controller. Authentication is supplied by the router.