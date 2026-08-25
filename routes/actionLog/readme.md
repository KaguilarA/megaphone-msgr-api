# Action Log Routes

Base path: `/action-log`.

All routes use `OwlIsAuth`. They do not currently apply `requirePermission` or create a second audit entry through `actionLogMiddleware`.

| Method | Path | Responsibility |
| --- | --- | --- |
| GET | `/` | List audit records. |
| POST | `/` | Create an audit record. |
| GET | `/:id` | Read one audit record. |
| PUT | `/:id` | Update one audit record. |
| DELETE | `/:id` | Delete one audit record. |

Handlers are supplied by the generic `OwlController` factory.
