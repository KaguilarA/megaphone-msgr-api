# Contact Controller

## Responsibility

Manages contacts owned by the authenticated user.

## Public methods

- `getAll`: lists contacts where `owner` is the authenticated user ID.
- `getById`: returns a contact by ID.
- `register`: creates a contact with at least one phone number and assigns its owner.
- `importContacts`: imports phone-only contacts from CSV, JSON, or Excel `.xlsx` files.
- `update`: updates a contact by ID.
- `delete`: deletes a contact by ID.

## Dependencies

The factory accepts `{ id, model, phoneNumberModel, stateModel }`.

## Limitations

Contact names are optional. Lists include each contact's phone numbers for display. File
imports require one phone column, normalize local numbers with the selected country code,
skip duplicates, and create one unnamed contact per valid phone. The controller checks
ownership for ID-based reads, updates, and deletes.
