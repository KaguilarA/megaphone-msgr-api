# Startup Utilities

This directory contains the application startup and route-initialization helpers.

## Modules

| Module | Responsibility |
| --- | --- |
| `init.js` | Creates the Express app and coordinates startup from environment settings. |
| `start.js` | Connects MongoDB, then initializes sessions and routes. |
| `initApiRoutes.js` | Configures `OwlSession` and mounts every route from the central registry. |
| `validateConfig.js` | Fails startup when required environment settings are missing or invalid. |

## Startup sequence

1. `index.js` invokes `init()`.
2. `init()` validates required environment settings and creates the Express application
   with the configured frontend origin and port.
3. `start()` opens the MongoDB connection through `OwlMongoConnect`.
4. `initApiRoutes()` configures the MongoDB-backed session middleware and mounts each entry from `consts/config.js`.

Database connection failures are reported to the console and terminate the process with a non-zero exit code. The Express application owns graceful shutdown for `SIGINT` and `SIGTERM`.

## Clustering

`index.js` calls `OwlClusterWorkerCount` from `owl-expressjs-utils` to determine the worker
count. It defaults to one worker and caps the requested `CLUSTER_WORKERS` value at
`availableParallelism()` so the process never requests more workers than the host exposes.

## Related files

- `app/app.js`: Express configuration and graceful shutdown.
- `consts/index.js`: environment-derived settings.
- `consts/config.js`: feature route registry.
