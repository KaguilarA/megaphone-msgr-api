# Token Model

## Responsibility

Stores messaging-provider credentials owned by a `User`.

## Fields

| Field | Rules |
| --- | --- |
| `emailToken` | Optional trimmed encrypted string. |
| `whatsappSession` | Optional trimmed WAHA session name associated with the phone. |
| `whatsappToken` | Legacy optional encrypted string retained for existing records. |
| `whatsappVersion` | Legacy optional configuration retained for existing records. |
| `whatsappPhoneNumberId` | Legacy optional configuration retained for existing records. |
| `telegramToken` | Optional trimmed encrypted string. |
| `owner` | Required indexed `ObjectId` reference to `User`. |

## Security

`models/models.js` passes `emailToken`, `whatsappToken`, and `telegramToken` as `encryptedFields` to `OwlModel`. WAHA session names are identifiers, not credentials. The sender receives a Token model record explicitly and never reads credentials from environment variables.

## Limitations

The schema does not validate provider credentials, expiration, refresh, or owner existence.

## Implementation

- Schema data: `models/tokens/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/userTokens/routes.js`
