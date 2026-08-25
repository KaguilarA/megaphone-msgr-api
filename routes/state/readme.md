# State Routes

Base path: `/state`.

All routes use `OwlIsAuth` and the matching state permission. Only state creation is audited; listing is not logged.

| Method | Path | Required permission | Responsibility |
| --- | --- | --- | --- |
| GET | `/` | `state:getList` | List state definitions. |
| POST | `/` | `state:register` | Create a state definition. |

The router delegates to generic `OwlController`. The current router does not expose read, update, or delete by ID.
