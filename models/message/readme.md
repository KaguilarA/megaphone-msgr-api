# Message Model

## Responsibility

Stores message content created by a user. Recipient links are stored separately in `MessageReceptor`.

## Fields

| Field | Rules |
| --- | --- |
| `content` | Required trimmed string. |
| `header` | Required trimmed string. |
| `sender` | Required `ObjectId` reference to `User`. |
| `state` | Required `ObjectId` reference to `State`. |

## Relationships

A message may have multiple `MessageReceptor` records, each linking it to one contact. The model does not embed recipients.

## Limitations

The schema does not track provider delivery status, provider IDs, or delivery failures. External sending is outside the model layer.

## Implementation

- Schema data: `models/message/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/message/routes.js`
