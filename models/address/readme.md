# Address Model

## Responsibility

Stores a physical address owned by either a `User` or a `Contact`, with optional geographic coordinates and state.

## Fields

| Field | Rules |
| --- | --- |
| `street`, `city`, `postalCode`, `country` | Optional trimmed strings. |
| `latitude` | Optional number from `-90` to `90`. |
| `longitude` | Optional number from `-180` to `180`. |
| `owner` | Required `ObjectId`; resolves through `ownerType`. |
| `ownerType` | Required; `User` or `Contact`. |
| `state` | Optional `ObjectId` reference to `State`. |

## Ownership

Always query `owner` and `ownerType` together. The schema uses `refPath: "ownerType"` and does not verify that the referenced document exists.

## Limitations

The model does not geocode addresses, validate postal codes, or verify coordinate consistency. Authorization is handled by routes and controllers.

## Implementation

- Schema data: `models/address/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/address/routes.js`
