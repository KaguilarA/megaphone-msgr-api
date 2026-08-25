# Contact Routes

Base path: `/contact`.

All routes use `OwlIsAuth`.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Create a contact owned by the session user. |
| GET | `/` | List contacts owned by the session user. |
| GET | `/:id` | Read a contact by ID. |
| PUT | `/:id` | Update a contact by ID. |
| DELETE | `/:id` | Delete a contact by ID. |

The router delegates to `ContactController`.
