# Email Routes

Base path: `/email`.

`POST /` is public. `OwlIsAuth` protects every route declared after the router-level middleware.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Public | Create a user-owned email. |
| POST | `/contact` | Authenticated | Create a contact-owned email. |
| GET | `/` | Authenticated | List current-user emails. |
| GET | `/:id` | Authenticated | Read an email by ID. |
| GET | `/:id/contact` | Authenticated | List emails for a contact. |
| PUT | `/:id` | Authenticated | Update an email by ID. |
| DELETE | `/:id` | Authenticated | Delete an email by ID. |

The router delegates to `EmailController`.
