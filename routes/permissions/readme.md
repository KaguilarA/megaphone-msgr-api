# Permission Routes

Base path: `/permission`.

Every route uses this middleware order:

1. `OwlIsAuth`
2. `requirePermission`
3. `actionLogMiddleware`
4. Generic `OwlController` handler

| Method | Path | Required permission |
| --- | --- | --- |
| GET | `/` | `read_permission` |
| POST | `/` | `create_permission` |
| GET | `/:id` | `read_permission` |
| PUT | `/:id` | `update_permission` |
| DELETE | `/:id` | `delete_permission` |

The audit middleware records the authenticated user, permission, action, request metadata, and response status.
