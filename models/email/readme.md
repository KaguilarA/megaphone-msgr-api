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
| `smtpHost`, `smtpPort`, `smtpUser`, `smtpSecure`, `smtpFromName` | Optional outbound SMTP configuration for a user's sender email. |
| `smtpPassword` | Optional SMTP credential encrypted by `OwlModel`; never returned by API responses. |

## Persistence behavior

Mongoose lowercases and trims the email before persistence. The schema does not declare a uniqueness constraint; duplicate addresses are therefore not rejected by this model.

## Limitations

The schema does not verify mailbox ownership, DNS, referenced documents, or state compatibility.

## Implementation

- Schema data: `models/email/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/email/routes.js`

Configure SMTP with `POST /email/smtp`. Send to owned contacts with `POST /email/send`; the
address list is sent as BCC. The SMTP password is only accepted by the dedicated settings
endpoint and is never exposed in API responses.
