# Email Model

## Responsibility

Stores one normalized email address owned by a `User` or `Contact`.

## Fields

| Field | Rules |
| --- | --- |
| `email` | Required, trimmed, lowercased string matching `^\S+@\S+\.\S+$`. |
| `owner` | Required indexed `ObjectId`; resolves through `ownerType`. |
| `ownerType` | Required; `User` or `Contact`. |
| `state` | Required `ObjectId` reference to `State`. |

## Persistence behavior

Mongoose lowercases and trims the email before persistence. The schema does not declare a uniqueness constraint; duplicate addresses are therefore not rejected by this model.

## Limitations

The schema does not verify mailbox ownership, DNS, referenced documents, or state compatibility.

## Implementation

- Schema data: `models/email/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/email/routes.js`
