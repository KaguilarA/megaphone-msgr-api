# Trigger para despertar el backend

El Worker de Cloudflare `megaphone-backend-health` consulta
`https://megaphone-msgr-api.onrender.com/health` cada diez minutos, igual que
`taurus-backend-health` en Taurus. El cron es `3-53/10 * * * *`: minutos
3, 13, 23, 33, 43 y 53 de cada hora, todos los días.

El código comprueba HTTP 200, JSON y `status: "ok"`. Un error HTTP, una respuesta
HTML o una base desconectada hace fallar la ejecución y queda registrado en
Cloudflare. El tiempo máximo de la consulta es 60 segundos, incluido su cuerpo.
No consulta datos privados, no utiliza credenciales y no realiza escrituras.
Su endpoint HTTP devuelve 404; solo el trigger programado ejecuta la consulta.

El código y la configuración reproducible están en `worker.js` y
`wrangler.jsonc`. El despliegue inicial se realiza mediante la sesión existente
del panel de Cloudflare. Los cambios posteriores en el panel y estos archivos
deben mantenerse sincronizados.

La configuración del cron puede tardar hasta quince minutos en propagarse.
Para verificarlo, revisar ejecuciones reales del trigger en Observability;
una prueba manual no demuestra que el cron automático ya se haya ejecutado.
Documentación: https://developers.cloudflare.com/workers/configuration/cron-triggers/

Las consultas periódicas ayudan a despertar o mantener activo Render, pero
siguen aplicando los límites de disponibilidad y cuota del plan gratuito.

Pruebas locales: `node --test scripts/keep-alive.test.mjs`.

Antes de exportar o publicar: `npm run build:worker` desde la raíz.
Usar `dist/keep-alive/worker.js` y `dist/keep-alive/wrangler.jsonc`.
Wrangler con la configuración fuente también ejecuta la compilación automáticamente.
