

# Megaphone Messager — API (Backend)

Backend project for Megaphone Messager: a REST API built with Express.js that manages users, contacts and messages.

**Features**

- Authentication and session management.
- Endpoints for users, contacts, addresses, emails, phone numbers and messages.
- Models for users, tokens, messages, addresses and contact data.
- Basic unit and integration tests included.

**Project structure**

- `config/` — Configuration files (CORS, session, etc.).
- `controllers/` — Business logic and route handlers.
- `db/` — Database configuration and models.
- `middlewares/` — Middlewares (e.g. `isAuth`).
- `routes/` — API route definitions.
- `test/` — Automated tests.

Refer to the source files for implementation details.

**Requirements**

- Node.js (recommended 14+)
- NPM or Yarn
- Database (configured in `db/config/database.js`)

**Installation**

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (examples):

- `PORT` — port where the API will run.
- Database connection variables used in `db/config/database.js`.

3. Initialize the database (according to your setup) and run migrations/seeders if applicable.

**Run**

- Development:

```bash
npm run dev
```

- Production / start:

```bash
npm start
```

**Tests**

```bash
npm test
```

**Main endpoints**

Routes are defined in the `routes/` folder. Some exposed endpoints include:

- `/auth` — authentication and token handling.
- `/user` — user management.
- `/contact` — contact management.
- `/message` — sending and retrieving messages.
- `/address`, `/email`, `/phoneNumber` — related resources.

See the controllers in `controllers/` for functional documentation of each endpoint.

**Contributing**

1. Fork the repository and create a feature branch.
2. Add tests for relevant changes.
3. Open a pull request describing the motivation and changes.

**License**

Project license is available in `LICENSE`.

---

If you want, I can also generate a `README` for the Angular frontend or add usage examples with `curl` / Postman.
