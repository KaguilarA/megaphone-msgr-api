# User Token Routes

Base path: `/tokens`.

All routes use `OwlIsAuth` and delegate to generic `OwlController`.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Create user-owned provider credentials. |
| GET | `/` | List token documents. |
| GET | `/:id` | Read one token document. |
| PUT | `/:id` | Update one token document. |
| DELETE | `/:id` | Delete one token document. |

Token fields configured as encrypted by `TokenModel` remain the responsibility of the model factory. Route ownership filtering is not implemented by the generic handler.
