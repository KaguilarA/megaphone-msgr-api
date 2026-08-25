# Message Controller

## Responsibility

Manages messages sent by the authenticated user and their contact recipient links.

## Public methods

- `register`: saves a message with the current user as sender and creates one `MessageReceptor` per contact.
- `getAll`: lists messages whose sender is the session user.
- `getById`: returns a message and its populated recipient links.
- `update`: updates message fields and optionally replaces all recipient links.
- `delete`: removes recipient links before deleting the message.
- `createReceptors`: creates recipient join records.
- `clearReceptors`: deletes all join records for a message.

## Dependencies

The factory accepts `{ id, model, receptorModel, populatedFields }`.

## Limitations

This controller does not implement external provider delivery. The current message schema requires `content`, `header`, and `sender`; recipient links are separate documents.
