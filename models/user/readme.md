# User Model

## Responsibility

Stores account identity and the password credential used by session authentication.

## Fields

| Field | Rules |
| --- | --- |
| `name` | Required trimmed string. |
| `lastname` | Required trimmed string. |
| `password` | Required trimmed string; hashed and hidden by `OwlModel`. |
| `state` | Optional `ObjectId` reference to `State`. |

## Security

`models/models.js` configures `password` as a hashed field. Password comparison must use the model helper rather than exposing the stored hash.

## Relationships

Users own contacts, emails, phone numbers, addresses, tokens, and messages. User registration also assigns all permissions whose names do not begin with `user:`.

## Limitations

Email uniqueness belongs to the `Email` model. The schema does not enforce state existence or authorization.

## Implementation

- Schema data: `models/user/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/user/routes.js`
