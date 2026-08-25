# Address Routes

Base path: `/address`.

All routes use `OwlIsAuth` and require `req.session.userId`.

| Method | Path | Responsibility |
| --- | --- | --- |
| GET | `/` | List current-user addresses. |
| GET | `/:id` | Read an address by ID. |
| GET | `/:id/contact` | List addresses for a contact. |
| POST | `/` | Create a user-owned address. |
| POST | `/:id/contact` | Create a contact-owned address. |
| PUT | `/:id` | Update an address by ID. |
| DELETE | `/:id` | Delete an address by ID. |

Route registration is configured in `config.js`. ID-based operations are not consistently owner-scoped by the controller.
