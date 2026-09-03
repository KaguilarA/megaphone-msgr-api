# Configuration

This directory contains environment-derived settings and the API route registry.

## Environment settings

`index.js` loads variables from `.env` and exports the values used during startup:

| Variable | Purpose | Default |
| --- | --- | --- |
| `CLUSTER_ENABLED` | Enables Node.js clustering when set to `true`. | `false` |
| `PORT` | HTTP listening port. | `3000` |
| `DB_HOST` | MongoDB connection host or URI. | Required |
| `DB_NAME` | MongoDB database name used by sessions. | Required |
| `FRONTEND_URL` | Allowed frontend origin for CORS. | Required |
| `NODE_ENV` | Runtime environment used by session configuration. | Unset |
| `SESSION_SECRET` | Secret used to sign session data. | Development fallback only |

Use the root `.env.example` as the configuration checklist. Production deployments must define a strong `SESSION_SECRET`; the fallback exists only to avoid an undefined local value.

## Route registry

`config.js` exports an ordered list of route definitions. Each entry provides:

- `url`: route prefix mounted by `utils/initApiRoutes.js`.
- `config`: models, permissions, populated fields, and action names injected into the feature.
- `router`: the router factory that receives the configuration.

This keeps dependency wiring centralized while controllers and routers remain independently testable. To add a route group, instantiate its model in `models/models.js`, import its router here, and add one registry entry.

## Related files

- `models/models.js`: centralized model instances.
- `utils/initApiRoutes.js`: mounts registered routers.
- `routes/`: router factories that consume the injected configuration.
