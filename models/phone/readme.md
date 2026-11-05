# Phone Model

## Responsibility

Stores a phone number owned by a `User` or `Contact`, with one or more related states.

## Fields

| Field | Rules |
| --- | --- |
| `phone` | Required trimmed string. |
| `countryNumber` | Required trimmed calling-code string. |
| `owner` | Required indexed `ObjectId`; resolves through `ownerType`. |
| `ownerType` | Required; `User` or `Contact`. |
| `tokens.whatsapp` | Optional `ObjectId` reference to the encrypted WhatsApp `Token` document for this phone. |
| `tokens.telegram` | Optional `ObjectId` reference to the encrypted Telegram `Token` document for this phone. |
| `state` | Array of required `ObjectId` references to `State`. |

## Limitations

The controller normalizes phone formatting, validates international syntax and enforces user/contact ownership. A partial unique index on `(ownerType, owner, e164)` prevents concurrent duplicates after migration. This does not verify that a number exists or that Meta assigned it to the configured business. See `docs/phone-numbers-rollout.md` for migration and deployment steps.

## Implementation

- Schema data: `models/phone/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/phone/routes.js`
