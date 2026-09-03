# Megaphone Messenger API

Backend REST API for Megaphone Messenger. The application is built with Node.js, Express,
MongoDB, Mongoose, and `owl-expressjs-utils`.

## Version

This documentation describes version 1.0.0.

## Features

- Session-based authentication with MongoDB-backed sessions.
- User registration, login, logout, and account status.
- User-owned contacts and messages.
- User and contact emails, phone numbers, and addresses.
- Reusable state definitions for application entities.
- Permission assignments and permission-aware routes.
- Action logging after permission-aware responses.
- Encrypted provider tokens and hashed user passwords.
- Centralized model instantiation through `models/models.js`.

## Requirements

- Node.js `>=24.0.0`
- npm `>=10.0.0`
- A reachable MongoDB instance

## Installation

```bash
npm install
```

Create a `.env` file in the project root. Use `.env.example` as the variable checklist:

```env
CLUSTER_ENABLED=false
CLUSTER_WORKERS=1
DB_HOST=mongodb://127.0.0.1:27017/megaphone
DB_NAME=megaphone
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
ENCRYPTION_ALGORITHM=aes-256-gcm
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret
```

`DB_HOST`, `DB_NAME`, `FRONTEND_URL`, and `SESSION_SECRET` must be configured for a normal
local run. Use a unique encryption key and session secret outside development.

## Running

Development mode enables Node's file watcher:

```bash
npm run dev
```

Start the API normally with:

```bash
npm start
```

By default, the server listens on `http://localhost:3000`. Set `CLUSTER_ENABLED=true` to
start the API through Node.js clustering. The current entry point uses the default worker
count supplied by `utils/workerCount.js`.

## Authentication

Successful login stores the authenticated user ID in `req.session.userId`. Protected routes
use `OwlIsAuth` from `owl-expressjs-utils` and require that session value.

The login flow resolves a user-owned email, compares the password through the hashed user
model, and creates the session. Requests from the frontend must send the session cookie.

## Permissions and audit logging

Permission-protected routes use this middleware order:

1. `OwlIsAuth`
2. `requirePermission(...)`
3. `actionLogMiddleware(...)`
4. The controller or generic `OwlController` handler

The reusable `actionLogMiddleware` factory records configured write operations. It stores the authenticated user, permission,
action, request metadata, and response status after `res.json`, `res.send`, or `res.end` is called. Audit logging is currently
configured for state registration; other features can opt in through their router middleware chain.

## API route groups

| Prefix | Responsibility | Access |
| --- | --- | --- |
| `/auth` | Login, logout, and authentication status | Public |
| `/user` | Registration and user profile | Registration public; profile authenticated |
| `/contact` | User-owned contacts | Authenticated |
| `/address` | User and contact addresses | Authenticated |
| `/email` | User and contact emails | Root registration public; remaining routes authenticated |
| `/phone-number` | User and contact phone numbers | Root registration public; remaining routes authenticated |
| `/message` | Messages and recipient relationships | Authenticated |
| `/state` | State definitions | Authenticated plus state permissions |
| `/countries` | Country and calling-code catalog | Public |
| `/tokens` | User provider credentials | Authenticated |
| `/action-log` | Audit records | Authenticated |

See the complete endpoint tables in [routes/readme.md](routes/readme.md) and each feature's
route README.

## Project structure

```text
index.js                   Express application entry point
app/                       Express application factory
consts/                    Environment settings and route configuration
controllers/               Resource-specific request handlers
models/                    Schema data and centralized OwlModel registry
middlewares/               Permission validation and action logging
routes/                    Express router factories
test/                      Node test suite and JSON fixtures
utils/                     Startup, session, route, and worker helpers
.env.example               Environment variable checklist
```

## Model architecture

Individual model files export schema data and `modelName`. The only file that calls
`OwlModel` is [models/models.js](models/models.js), which exports the instantiated models used
by the application.

- User passwords are hashed by `OwlModel`.
- Email, WhatsApp, and Telegram tokens are encrypted by `OwlModel`.
- Email, phone number, and address ownership uses `owner` plus `ownerType`.
- Message recipients are stored in `MessageReceptor` documents.

Read the model-specific documentation in [models/readme.md](models/readme.md).

## Testing

Run the complete automated suite:

```bash
npm test
```

The suite covers authentication, contacts, addresses, emails, phone numbers, messages,
states, permissions, user-permission assignments, action logging, and user registration.
Tests use realistic JSON fixtures under `test/mocks` and mock data-access boundaries; they do
not replace a full end-to-end persistence test against MongoDB.

## Important limitations

- Several ID-based read, update, and delete operations are not consistently owner-scoped.
- Generic CRUD routes expose behavior supplied by `OwlController`.
- `MessageReceptor` is an internal model and has no standalone route.
- State compatibility with the entity that references it is not enforced by the schema.
- Provider credentials are encrypted, but provider validation and token refresh are outside the API.

## Documentation map

- [Models](models/readme.md)
- [Controllers](controllers/readme.md)
- [Routes](routes/readme.md)
- [Middleware](middlewares/readme.md)
- [Startup utilities](utils/readme.md)
- [Configuration](consts/readme.md)
- [Environment template](.env.example)

## License

See [LICENSE](LICENSE).
