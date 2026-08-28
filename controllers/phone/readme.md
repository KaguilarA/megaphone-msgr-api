# Phone Controller

## Responsibility

Coordinates phone-number operations for users and contacts.

## Public methods

- `getUserPhoneNumber`: lists phone numbers owned by the current user.
- `getContactPhoneNumber`: lists phone numbers owned by a contact ID.
- `getById`: returns one phone number by ID.
- `registerUserPhoneNumber`: creates a user-owned number.
- `registerContactPhoneNumber`: creates a contact-owned number.
- `update`: updates a phone number by ID.
- `delete`: deletes a phone number by ID.

## Dependencies

The factory accepts `{ id, model }`, where `model` is `PhoneNumberModel`.

New phone numbers receive the `active` state for type `phone` automatically. The
controller reuses that state when it exists and creates it when it is missing.

## Route boundary

The current root `POST /phone-number` route is public. Other routes are protected by `OwlIsAuth`.
