# Email Routes

Base path: `/email`.

All routes require authentication and their corresponding permissions. Sending email also requires `Message:register`.

| Method | Path | Auth | Responsibility |
| --- | --- | --- | --- |
| POST | `/` | Authenticated | Create a user-owned email. |
| POST | `/send` | Authenticated, `Message:register` and `Email:registerForUser` | Send email to owned contacts. |
| POST | `/:id/contact` | Authenticated | Create an email owned by the contact in `:id`. |
| GET | `/` | Authenticated | List current-user emails. |
| GET | `/:id` | Authenticated | Read an email by ID. |
| GET | `/:id/contact` | Authenticated | List emails for a contact. |
| PUT | `/:id` | Authenticated | Update an email by ID. |
| DELETE | `/:id` | Authenticated | Delete an email by ID. |

The router delegates to `EmailController`.

Successful outbound sends are recorded in the shared message history with the email channel,
subject, message text, sender, and recipient delivery results.
