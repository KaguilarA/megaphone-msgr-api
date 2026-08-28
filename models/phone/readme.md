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
| `state` | Array of required `ObjectId` references to `State`. |

## Limitations

The schema does not normalize phone formatting, validate country codes, verify ownership, or ensure referenced documents exist.

## Implementation

- Schema data: `models/phone/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/phone/routes.js`
