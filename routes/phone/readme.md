# Phone Number Routes

Base path: `/phone-number`.

`OwlIsAuth` and route permissions protect every route. The controller also checks that each phone belongs to the session user or an owned contact.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Authenticated | Create an additional user-owned phone number. |
| POST | `/:id/contact` | Authenticated | Create a phone number owned by the contact in `:id`. |
| GET | `/` | Authenticated | List current-user phone numbers. |
| GET | `/:id` | Authenticated | Read a phone number by ID. |
| GET | `/:id/contact` | Authenticated | List phone numbers for a contact. |
| PUT | `/:id` | Authenticated | Update a phone number by ID. |
| DELETE | `/:id` | Authenticated | Delete a phone number by ID. |

The router delegates to `PhoneController`.
