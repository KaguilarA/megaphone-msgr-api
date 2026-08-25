# Permission Routes

Base path: `/permission`.

Write routes use this middleware order:

1. `OwlIsAuth`
2. `requirePermission`
3. `actionLogMiddleware`
4. Generic `OwlController` handler

Read routes use `OwlIsAuth`, `requirePermission`, and the generic handler without audit logging.

| Method | Path | Required permission |
| --- | --- | --- |
| GET | `/` | `read_permission` |
| POST | `/` | `create_permission` |
| GET | `/:id` | `read_permission` |
| PUT | `/:id` | `update_permission` |
| DELETE | `/:id` | `delete_permission` |

The audit middleware records the authenticated user, permission, action, request metadata, and response status.
