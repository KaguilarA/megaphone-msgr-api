# Routes

The `routes` layer defines the HTTP boundary of the backend. Each feature exposes a router factory that receives its dependencies from `config.js` and returns an Express router.

## Responsibilities

- Define HTTP methods and URL paths.
- Apply authentication middleware at the route boundary.
- Apply permission validation and audit logging where required.
- Bind controller or generic `OwlController` handlers.
- Keep HTTP composition separate from persistence and domain orchestration.

## Registration flow

`index.js` loads the route configuration from `config.js`. Each entry contains a URL prefix, dependency configuration, and router factory:

```js
{
  url: "/contact",
  config: {
    entityId: "Contact",
    model: ContactModel,
  },
  router: ContactRouter,
}
```

The application mounts the generated router under its configured prefix.

## Route map

| Prefix | Feature | Authentication | Handler style |
| --- | --- | --- | --- |
| `/address` | User and contact addresses | All routes authenticated | Custom `AddressController` |
| `/auth` | Login, logout, and status | Public | Custom `AuthController` |
| `/contact` | User-owned contacts | All routes authenticated | Custom `ContactController` |
| `/countries` | Country and calling-code catalog | Public | Custom `CountriesController` |
| `/email` | User and contact emails | Root registration public; remaining routes authenticated | Custom `EmailController` |
| `/message` | Messages and recipient links | All routes authenticated | Custom `MessageController` |
| `/phone-number` | User and contact phone numbers | Root registration public; remaining routes authenticated | Custom `PhoneController` |
| `/state` | State definitions | All current routes authenticated | Generic `OwlController` |
| `/user` | Registration and account profile | Registration public; profile routes authenticated | Custom user controller |
| `/tokens` | Provider credentials | All routes authenticated | Generic `OwlController` |
| `/permission` | Permission definitions | Authentication plus permission checks | Generic `OwlController` |
| `/user-permission` | User-permission assignments | Authentication plus permission checks | Generic `OwlController` |
| `/action-log` | Audit records | All routes authenticated | Generic `OwlController` |

## Authentication

Authenticated routes use `OwlIsAuth` from `owl-expressjs-utils`. The middleware checks `req.session.userId`, which is created by the successful login flow. Route handlers should use that session identifier when resolving the current user.

## Permission and audit middleware

Permission-management and user-permission routes apply middleware in this order:

1. `OwlIsAuth`
2. `requirePermission(...)`
3. `actionLogMiddleware(...)`
4. The controller handler

`requirePermission` checks the requested permission and its assignment to the session user. `actionLogMiddleware` records the action after the response is sent.

## Public registration routes

The following routes intentionally declare registration before `OwlIsAuth`:

- `POST /email`
- `POST /phone-number`
- `POST /user`

The route handler is responsible for assigning the appropriate owner and owner type. The current email and phone registration endpoints accept a request body before authentication middleware is applied.

## Scope and ownership

Routes provide authentication boundaries, but not every ID-based operation applies an owner filter. In particular, generic CRUD routes and several custom `getById`, `update`, and `delete` handlers operate by document ID. Ownership enforcement must therefore be reviewed at the controller or query layer when cross-user access prevention is required.

## Related files

- `config.js`: mounts each router and injects model dependencies.
- `controllers/`: request handlers and resource orchestration.
- `models/models.js`: central model instances supplied to routes.
- `middlewares/permissionMiddleware.js`: permission checks and action logging.
