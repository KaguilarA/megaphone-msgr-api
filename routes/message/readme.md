# Message Routes

Base path: `/message`.

All routes use `OwlIsAuth`.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Create a message and recipient links. |
| GET | `/` | List messages sent by the session user. |
| GET | `/:id` | Read a message and its recipients. |
| PUT | `/:id` | Update a message and optionally replace recipients. |
| DELETE | `/:id` | Delete a message and its recipient links. |

The router delegates to `MessageController`. External provider delivery is not implemented by this router.
