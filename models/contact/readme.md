# Contact Model

## Responsibility

Stores a contact belonging to one `User`. Related emails, phone numbers, and addresses remain separate documents.

## Fields

| Field | Rules |
| --- | --- |
| `name` | Optional trimmed string. |
| `owner` | Required indexed `ObjectId` reference to `User`. |
| `state` | Optional `ObjectId` reference to `State`. |

## Relationships

Contact-owned child resources use `owner: contact._id` and `ownerType: "Contact"`. The model does not embed those resources.
Contact creation requires at least one valid phone number; the controller stores phone numbers as separate owned resources.

## Limitations

The schema does not enforce that `owner` or `state` exists. ID-based authorization must be enforced by the HTTP layer.

## Implementation

- Schema data: `models/contact/model.js`
- Instantiation: `models/models.js`
- HTTP routes: `routes/contact/routes.js`
