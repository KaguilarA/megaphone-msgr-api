# Token Model

## Responsibility

Stores messaging-provider credentials owned by a `User`.

## Fields

| Field | Rules |
| --- | --- |
| `emailToken` | Optional trimmed encrypted string. |
| `whatsappToken` | Optional trimmed encrypted string used by messaging integrations. |
| `whatsappVersion` | Optional trimmed Meta Graph API version; not encrypted. |
| `whatsappPhoneNumberId` | Optional trimmed Meta business phone-number ID; not encrypted. |
| `telegramToken` | Optional trimmed encrypted string. |
| `owner` | Required indexed `ObjectId` reference to `User`. |

## Security

`models/models.js` passes `emailToken`, `whatsappToken`, and `telegramToken` as `encryptedFields` to `OwlModel`. WhatsApp version and phone-number ID are configuration, not secrets. The standalone sender receives a Token model record explicitly and never reads credentials from environment variables.

## Limitations

The schema does not validate provider credentials, expiration, refresh, or owner existence.

## Implementation

- Schema data: `models/tokens/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/userTokens/routes.js`
