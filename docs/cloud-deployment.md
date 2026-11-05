# Despliegue en Render y Cloudflare Pages

## Servicios

- Backend: https://megaphone-msgr-api.onrender.com
- Frontend: https://megaphone-msgr.pages.dev
- Base nueva prevista: `megaphone-production` en MongoDB Atlas.

Los workflows de ambos repositorios se ejecutan al actualizar `main`, en pull requests y manualmente. Solo los eventos sobre `main` publican artefactos en `production`, después de pasar las pruebas. Cada artefacto incluye `deployment.json` con el SHA del código fuente. Actions comprueba que el hosting publique ese SHA y que MongoDB responda antes de declarar exitoso el despliegue.

## Configuración persistente

En ambos repositorios de GitHub, la variable de Actions `DEPLOYMENT_URL` contiene el origen HTTPS correspondiente.

Render consume `production` del repositorio del backend, con auto-deploy al recibir commits, Node 24, build `npm ci --omit=dev --ignore-scripts`, inicio `node index.js` (equivalente a `npm start` con variables del hosting), y health check `/health`. El paquete excluye `.env`, pruebas y exportaciones de `db/`.

Cloudflare Pages consume `production` del frontend sin comando de build y con la raíz como directorio de salida: Angular ya se compila en Actions. Los previews automáticos están deshabilitados. Sus variables son:

```dotenv
BACKEND_ORIGIN=https://megaphone-msgr-api.onrender.com
PUBLIC_FRONTEND_URL=https://megaphone-msgr.pages.dev
```

El Worker reenvía `/api/*` a Render quitando `/api`, conserva cookies y cuerpos de webhooks, impide orígenes distintos y devuelve respuestas de API sin caché. Así la sesión del navegador pertenece al mismo origen del frontend.

## Primera instalación

La configuración privada local `.env.production` está ignorada por Git. Configura `DB_HOST` con una URI de Atlas que seleccione `megaphone-production`, con credenciales de una cuenta restringida a esa base. Conserva `ENCRYPTION_KEY` y `SESSION_SECRET`; no los publiques en repositorios ni en Cloudflare.

En Atlas permite los rangos de salida del servicio Render y la IP del equipo que ejecuta el instalador. No es necesario abrir acceso a todas las IPs.

Con la conexión lista, ejecuta:

```powershell
node --env-file=.env.production scripts/setup.js
```

El instalador pide los datos del primer administrador. También acepta `SETUP_ADMIN_NAME`, `SETUP_ADMIN_LAST_NAME`, `SETUP_ADMIN_EMAIL` y `SETUP_ADMIN_PASSWORD` como variables privadas. Es idempotente y requiere transacciones. Consulta [first-install.md](first-install.md).

Carga las variables de `.env.production` en **Environment** de Render y despliega el último commit de `production`. Después vuelve a ejecutar los workflows si agotaron su espera durante la configuración inicial.

## Verificación

1. `/deployment.json` de cada servicio coincide con su SHA de `main` publicado.
2. `https://megaphone-msgr.pages.dev/api/health` devuelve 200 y `{"status":"ok"}`.
3. El administrador puede iniciar sesión, recargar la página y completar el asistente.
4. Cada operador configura sus propios canales. Los envíos reales de WhatsApp y SMTP requieren credenciales del proveedor; el despliegue no los configura ni envía mensajes de prueba automáticamente.

Los servicios gratuitos de Render pueden suspenderse por inactividad, igual que el despliegue gratuito de Taurus.
