process.loadEnvFile();

const allowedOrigins = [process.env.FRONTEND_URL];

/**
 * CORS Middleware - Configura los headers CORS para permitir requests desde el frontend
 * Cuando se usan credenciales (cookies de sesión), no se puede usar wildcard '*'
 * y se debe especificar el origen exacto y agregar Access-Control-Allow-Credentials
 */
export default function (req, res, next) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight request
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
