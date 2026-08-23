# Message controller

## Overview

`MessageController` manages `Message` documents created by the authenticated `User` together
with their recipient list, modeled as `MessageReceptor` join documents (one per recipient
`Contact`). Every read, update, and delete of a message keeps its receptor documents in sync.

Sending the message through an external provider (WhatsApp, Telegram, etc.) is **not**
implemented here. That integration is intentionally deferred and will be added later as a
separate, dedicated module.

The controller is created through a factory function:

```js
export default ({ id, model, receptorModel, populatedFields }) =>
  new MessageController(id, model, receptorModel, populatedFields);
```

## Responsibilities

- Create a message owned by the authenticated user (`sender`).
- Create one `MessageReceptor` document per recipient contact ID supplied in `contacts`.
- Read a single message together with its populated receptors.
- List every message sent by the authenticated user.
- Update a message and, when a new `contacts` array is supplied, replace its receptor list.
- Delete a message and cascade-delete all of its receptor documents.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `register` | `POST /message` | Creates a message for `req.session.userId` and a `MessageReceptor` per ID in `req.body.contacts`. Returns the message with its `receptors`. |
| `getAll` | `GET /message` | Returns all messages where `sender` is the authenticated user, populated with `populatedFields`. |
| `getById` | `GET /message/:id` | Returns a message by ID with its populated `receptors`, or `404` if missing. |
| `update` | `PUT /message/:id` | Updates message fields. If `contacts` is an array, replaces the existing receptors with a new set. Returns `404` if the message does not exist. |
| `delete` | `DELETE /message/:id` | Deletes all receptors linked to the message, then deletes the message itself. |

## Request body (`register` / `update`)

```json
{
  "header": "string",
  "content": "string",
  "state": "ObjectId (optional)",
  "contacts": ["ObjectId", "..."]
}
```

`contacts` is an array of `Contact` IDs. It is never persisted on the `Message` document itself;
it is only used to create or replace `MessageReceptor` documents.

## Receptor management helpers

- `clearReceptors(messageId)`: loads every `MessageReceptor` for a message and deletes each one, since the shared model layer only supports delete-by-ID.
- `createReceptors(messageId, contactIds)`: saves one `MessageReceptor` per contact ID in parallel.

## Error handling

All methods respond with `500` and `{ error: message }` for unexpected failures. `getById` and
`update` respond with `404` and `{ message: "Message not found." }` when the message does not
exist.

## Related files

- `controllers/message/controller.js`: implementation.
- `routes/message.js`: route bindings, all protected by `OwlIsAuth`.
- [Message model](../../models/message/readme.md): schema and validation rules.
- [MessageReceptor model](../../models/messageReceptor/readme.md): recipient join schema.
- `config.js`: wires `model` (Message) and `receptorModel` (MessageReceptor) into this controller.
