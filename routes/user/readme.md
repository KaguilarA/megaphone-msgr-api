# User Routes

Base path: `/user`.

All routes use `OwlIsAuth`. User registration additionally requires `user:register`.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Authenticated plus `User:register` | Transactionally create an active operator, login email and explicit operational/self-profile permissions. |
| GET | `/` | Authenticated | Return the current user's profile. |
| PUT | `/` | Authenticated | Update the current user's profile. |

The router delegates to `UserController`.
