# Permission Model

## Responsibility

Defines a named permission that can be assigned to users through `UserPermission`.

## Fields

| Field | Rules |
| --- | --- |
| `name` | Required trimmed unique indexed string. |
| `description` | Optional trimmed string; defaults to an empty string. |

## Usage

Permission middleware looks up permissions by `name`. Routes for creating, reading, updating, and deleting permissions require the corresponding permission and write an `ActionLog` record.

## Limitations

The model does not grant permissions, assign users, or enforce authorization by itself. Uniqueness depends on the MongoDB index.

## Implementation

- Schema data: `models/permission/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/permissions/routes.js`
