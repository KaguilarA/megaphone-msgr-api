# Express Application

`app.js` creates and starts the Express application used by the API.

## HTTP configuration

- Disables the `X-Powered-By` response header.
- Trusts the first reverse proxy with `app.set("trust proxy", 1)`.
- Configures CORS through `OwlCors` for the supplied frontend origins.
- Parses JSON request bodies with a 1 MB size limit.

## Lifecycle

The application starts listening on the supplied port when this factory is called. It also registers `SIGINT` and `SIGTERM` handlers. On either signal, it closes the HTTP server, closes the MongoDB connection through `OwlMongoClose`, and exits with the appropriate status code.

Session setup and API route registration do not happen in this module. They are initialized by `utils/init.js` and `utils/initApiRoutes.js` after the Express app is created.

## Dependencies

- `express`: HTTP application and JSON parsing.
- `owl-expressjs-utils`: CORS configuration and MongoDB shutdown helper.

## Related files

- `utils/init.js`: creates the app and coordinates startup.
- `utils/start.js`: connects MongoDB before routes are mounted.
- `utils/initApiRoutes.js`: configures sessions and feature routers.
