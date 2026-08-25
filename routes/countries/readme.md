# Countries Routes

Base path: `/countries`.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| GET | `/` | Public | Return the formatted country dataset. |

The router delegates to `OwlController` with the injected country dataset and does not use `OwlIsAuth`.
