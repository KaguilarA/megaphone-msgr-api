# Startup Utilities

This directory contains the application startup and route-initialization helpers.

## Modules

| Module | Responsibility |
| --- | --- |
| `init.js` | Creates the Express app and coordinates startup from environment settings. |
| `start.js` | Connects MongoDB, then initializes sessions and routes. |
| `initApiRoutes.js` | Configures `OwlSession` and mounts every route from the central registry. |
| `workerCount.js` | Determines a valid worker count when clustering is enabled. |

## Startup sequence

1. `index.js` invokes `init()`.
2. `init()` creates the Express application with the configured frontend origin and port.
3. `start()` opens the MongoDB connection through `OwlMongoConnect`.
4. `initApiRoutes()` configures the MongoDB-backed session middleware and mounts each entry from `consts/config.js`.

Database connection failures are reported to the console and terminate the process with a non-zero exit code. The Express application owns graceful shutdown for `SIGINT` and `SIGTERM`.

## Clustering

`workerCount.js` returns one worker unless clustering is enabled. When enabled, it accepts a positive integer request and caps it at `availableParallelism()` so the process never requests more workers than the host exposes.

## Related files

- `app/app.js`: Express configuration and graceful shutdown.
- `consts/index.js`: environment-derived settings.
- `consts/config.js`: feature route registry.
