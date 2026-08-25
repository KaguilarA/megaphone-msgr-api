# Controllers

Controllers contain application behavior between HTTP requests and model operations. They receive dependencies through factory functions and return Express responses.

## Responsibilities

- Validate request-level preconditions and map errors to HTTP responses.
- Read authenticated identity from `req.session.userId` or the authenticated request context.
- Delegate persistence to `OwlModel` helpers.
- Keep resource-specific orchestration out of routes.

## Controllers

| Controller | Responsibility |
| --- | --- |
| Address | User/contact address lifecycle and ownership assignment. |
| Auth | Login, logout, and session status. |
| Contact | User-owned contact CRUD. |
| Countries | Read-only country dataset formatting. |
| Email | User/contact email lifecycle. |
| Message | Message lifecycle and recipient links. |
| Phone | User/contact phone lifecycle. |
| User | Account operations and default permission assignment. |

Permission, user-permission, action-log, state, and token CRUD use `OwlController` directly from `owl-expressjs-utils` through their routers.

## Boundaries

Routes provide authentication and permission middleware. Controllers do not replace schema validation or database constraints.
