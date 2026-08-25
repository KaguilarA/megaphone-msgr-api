# User Permission Routes

Base path: `/user-permission`.

Every route uses `OwlIsAuth`, the matching `requirePermission` middleware, `actionLogMiddleware`, and then generic `OwlController`.

| Method | Path | Required permission |
| --- | --- | --- |
| GET | `/` | `read_user_permission` |
| POST | `/` | `create_user_permission` |
| GET | `/:id` | `read_user_permission` |
| PUT | `/:id` | `update_user_permission` |
| DELETE | `/:id` | `delete_user_permission` |

Audit records contain the authenticated user, permission, action, metadata, and response status.
