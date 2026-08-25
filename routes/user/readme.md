# User Routes

Base path: `/user`.

All routes use `OwlIsAuth`. User registration additionally requires `user:register`.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Authenticated plus `user:register` | Register a user and assign default non-user permissions. |
| GET | `/` | Authenticated | Return the current user's profile. |
| PUT | `/` | Authenticated | Update the current user's profile. |

The router delegates to `UserController`.
