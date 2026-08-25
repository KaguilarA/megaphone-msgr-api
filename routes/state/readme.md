# State Routes

Base path: `/state`.

All routes use `OwlIsAuth`.

| Method | Path | Responsibility |
| --- | --- | --- |
| GET | `/` | List state definitions. |
| POST | `/` | Create a state definition. |

The router delegates to generic `OwlController`. The current router does not expose read, update, or delete by ID.
