# Token Model

## Responsibility

Stores messaging-provider credentials owned by a `User`.

## Fields

| Field | Rules |
| --- | --- |
| `emailToken` | Optional trimmed encrypted string. |
| `whatsappToken` | Optional trimmed encrypted string used by messaging integrations. |
| `whatsappVersion` | Optional trimmed string; not encrypted. |
| `telegramToken` | Optional trimmed encrypted string. |
| `owner` | Required indexed `ObjectId` reference to `User`. |

## Security

`models/models.js` passes `emailToken`, `whatsappToken`, and `telegramToken` as `encryptedFields` to `OwlModel`. `whatsappVersion` is intentionally not encrypted. The model output should not expose decrypted secrets beyond the utility's configured behavior.

## Limitations

The schema does not validate provider credentials, expiration, refresh, or owner existence.

## Implementation

- Schema data: `models/tokens/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/userTokens/routes.js`
