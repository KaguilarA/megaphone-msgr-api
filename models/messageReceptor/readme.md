# MessageReceptor Model

## Responsibility

Represents one recipient relationship between a `Message` and a `Contact`.

## Fields

| Field | Rules |
| --- | --- |
| `message` | Required `ObjectId` reference to `Message`. |
| `contact` | Required `ObjectId` reference to `Contact`. |

## Lifecycle

`MessageController` creates one record per contact and removes linked records before deleting a message. This model has no public router in the current configuration.

## Limitations

There is no uniqueness constraint, delivery status, provider message ID, or independent authorization policy.

## Implementation

- Schema data: `models/messageReceptor/model.js`
- Instantiation: `models/models.js`
- Lifecycle owner: `controllers/message/controller.js`
