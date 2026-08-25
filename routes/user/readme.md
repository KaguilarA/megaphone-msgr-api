# User Routes

Base path: `/user`.

`POST /` is public. `OwlIsAuth` protects routes declared after the router-level middleware.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Public | Register a user and assign default non-user permissions. |
| GET | `/` | Authenticated | Return the current user's profile. |
| PUT | `/` | Authenticated | Update the current user's profile. |

The router delegates to `UserController`.
