# Phone Number Routes

Base path: `/phone-number`.

`POST /` is public. `OwlIsAuth` protects every route declared after the router-level middleware.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Public | Create a user-owned phone number. |
| POST | `/:id/contact` | Authenticated | Create a phone number owned by the contact in `:id`. |
| GET | `/` | Authenticated | List current-user phone numbers. |
| GET | `/:id` | Authenticated | Read a phone number by ID. |
| GET | `/:id/contact` | Authenticated | List phone numbers for a contact. |
| PUT | `/:id` | Authenticated | Update a phone number by ID. |
| DELETE | `/:id` | Authenticated | Delete a phone number by ID. |

The router delegates to `PhoneController`.
