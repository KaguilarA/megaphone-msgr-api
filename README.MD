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

Create a `.env` file in the project root and populate the required values. Generate a
unique 32-byte encryption key and a long session secret; do not use the sample values as
production credentials:

```env
CLUSTER_ENABLED=false
CLUSTER_WORKERS=1
DB_HOST=mongodb://127.0.0.1:27017/megaphone
DB_NAME=megaphone
ENCRYPTION_KEY=<64-character-random-hex-key>
ENCRYPTION_ALGORITHM=aes-256-gcm
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
PORT=3000
SESSION_SECRET=<at-least-32-random-characters>
META_API_URL=https://graph.facebook.com
META_API_VERSION=<supported-graph-api-version>
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=megaphone/messages
TINYPNG_API_KEY=
```

`DB_HOST`, `DB_NAME`, `FRONTEND_URL`, `NODE_ENV`, `SESSION_SECRET`, and `ENCRYPTION_KEY` are
required at startup. Startup validation rejects missing or malformed values without logging
their contents. Set the WhatsApp credentials only if you use the standalone WhatsApp sender.
Cloudinary variables are optional for text-only messages, but all three credentials are
required together when uploading images or videos. Message uploads are limited to 16 MB and
are stored as Cloudinary assets before their secure URL is sent through WhatsApp.
Images are compressed through TinyPNG before the Cloudinary upload; videos bypass TinyPNG.
For incoming WhatsApp autoresponses, configure `WHATSAPP_WEBHOOK_VERIFY_TOKEN` and
`WHATSAPP_APP_SECRET`, expose `GET/POST /webhooks/whatsapp` through HTTPS, and set
`WHATSAPP_AUTO_REPLY_KEYWORD` plus `WHATSAPP_AUTO_REPLY_TEXT`. The current rule replies with
the configured text when an incoming message contains the configured keyword; it uses the
WhatsApp token associated with the receiving phone number.

Production frontend builds use `/api` as the API base URL. Configure the reverse proxy to
forward `/api` to this backend and preserve HTTPS cookies and the `X-Hub-Signature-256` header.

Generate suitable secrets locally:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

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
start the API through Node.js clustering. `CLUSTER_WORKERS` controls the worker count and
is capped at the available CPU parallelism.

## Standalone WhatsApp sender

`integrations/whatsapp.js` exports `sendWhatsAppMessage(recipient, message, tokenRecord)`,
which sends plain text through the Meta WhatsApp Cloud API. It is deliberately independent
of Express, the database, and the API routes. Pass the record retrieved from the Token model;
the WhatsApp token is stored encrypted there, and the API version and phone-number ID come
from that record:

```js
import { sendWhatsAppMessage } from "./integrations/whatsapp.js";

const tokenRecord = await TokenModel.getOne({ owner: userId });
const result = await sendWhatsAppMessage(
  "+14155552671",
  "Hello from Megaphone!",
  tokenRecord,
);
console.log(result.messages[0].id);
```

The Token record must contain `whatsappToken`, `whatsappVersion`, and
`whatsappPhoneNumberId`. The recipient must be an E.164 phone number. The function throws
on invalid input, network failures, timeouts, or provider errors; callers should handle
those errors.

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
- Run `npm audit --omit=dev` before deployment. The current dependency tree includes
  high-severity advisories in the Mongoose version nested under `owl-expressjs-utils`; that
  dependency needs an upstream update or a verified compatible override before production.

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
