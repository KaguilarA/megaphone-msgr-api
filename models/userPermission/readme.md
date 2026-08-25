# UserPermission Model

## Responsibility

Represents one assignment between a `User` and a `Permission`.

## Fields

| Field | Rules |
| --- | --- |
| `user` | Required indexed `ObjectId` reference to `User`. |
| `permission` | Required indexed `ObjectId` reference to `Permission`. |

## Usage

`requirePermission` looks up an assignment using both fields. User registration creates assignments for all permissions except names beginning with `user:`.

## Limitations

The schema has no compound uniqueness constraint, so duplicate assignments are possible. It does not independently authorize requests or verify referenced documents.

## Implementation

- Schema data: `models/userPermission/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/userPermission/routes.js`
