# Contact Controller

## Responsibility

Manages contacts owned by the authenticated user.

## Public methods

- `getAll`: lists contacts where `owner` is the authenticated user ID.
- `getById`: returns a contact by ID.
- `register`: creates a contact and assigns its owner.
- `update`: updates a contact by ID.
- `delete`: deletes a contact by ID.

## Dependencies

The factory accepts `{ id, model }`, where `model` is `ContactModel`.

## Limitations

Only list and create explicitly derive ownership from the session. ID-based reads, updates, and deletes require additional ownership enforcement if cross-user access must be prevented.
