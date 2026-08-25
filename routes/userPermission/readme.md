# User Permission Routes

Base path: `/user-permission`.

Write routes use `OwlIsAuth`, the matching `requirePermission`, `actionLogMiddleware`, and generic `OwlController`. Read routes use authentication and permission checks without audit logging.

The permission check endpoint is the exception: it uses `OwlIsAuth` and directly checks the requested permission assignment so the frontend can decide whether to show a feature. It does not require `read_user_permission` and does not create an audit record.

| Method | Path | Required permission |
| --- | --- | --- |
| GET | `/check/:permission` | Authenticated session only |
| GET | `/` | `read_user_permission` |
| POST | `/` | `create_user_permission` |
| GET | `/:id` | `read_user_permission` |
| PUT | `/:id` | `update_user_permission` |
| DELETE | `/:id` | `delete_user_permission` |

Audit records contain the authenticated user, permission, action, metadata, and response status.
