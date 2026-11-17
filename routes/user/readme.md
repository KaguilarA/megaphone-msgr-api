# User Routes

Base path: `/user`.

Self-registration is public. All other routes use `OwlIsAuth`.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create an account without `Contact:register` or `Message:register`; an administrator can grant these permissions. |
| POST | `/` | Authenticated plus `User:register` | Transactionally create an active operator, login email and explicit operational/self-profile permissions. |
| GET | `/` | Authenticated | Return the current user's profile. |
| PUT | `/` | Authenticated | Update the current user's profile. |

The router delegates to `UserController`.
