# Action Log Routes

Base path: `/action-log`.

All routes use `OwlIsAuth`. Write operations are audited; read operations are intentionally not logged.

| Method | Path | Responsibility |
| --- | --- | --- |
| GET | `/` | List audit records. |
| POST | `/` | Create an audit record. |
| GET | `/:id` | Read one audit record. |
| PUT | `/:id` | Update one audit record. |
| DELETE | `/:id` | Delete one audit record. |

Handlers are supplied by the generic `OwlController` factory.
