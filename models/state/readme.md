# State Model

## Responsibility

Stores reusable status definitions scoped to an entity category.

## Fields

| Field | Rules |
| --- | --- |
| `name` | Required string. |
| `description` | Optional string; defaults to an empty string. |
| `type` | Required enum: `address`, `user`, `contact`, `email`, or `phone`. |

## Usage

Other models reference state documents through `ObjectId`. The model does not automatically assign states or verify that a referenced state matches the target entity type.

## HTTP surface

The current router exposes authenticated `GET /state` and `POST /state` only.

## Implementation

- Schema data: `models/state/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/state/routes.js`
