# Varios números por usuario

`Phone` sigue siendo una entidad compartida por `User` y `Contact`. Cada propietario puede tener varios números. El mismo número puede existir en propietarios distintos; la unicidad es `(ownerType, owner, e164)`. No se modifica la identidad del usuario ni su inicio de sesión por email.

## Contrato

- `POST /phone-number`: `{ phone, countryNumber }`, asociado a la sesión. `phone` es el número nacional; `countryNumber` es el prefijo internacional, por ejemplo `+506`. Se eliminan espacios, guiones, puntos y paréntesis. Se valida la estructura internacional (8–15 dígitos en total), sin afirmar que el número exista o esté verificado.
- `GET /phone-number`: todos los números del usuario, sin limitar a uno.
- `GET|PUT|DELETE /phone-number/:id`: solo números propios o de contactos propios. `PUT` acepta exclusivamente los campos del número; no transfiere propietarios ni modifica tokens o estados.
- `POST|GET /phone-number/:id/contact`: exige que el contacto pertenezca al usuario.
- `POST /tokens`: `{ phone, whatsappToken, whatsappVersion, whatsappPhoneNumberId }`. El ID de Meta debe corresponder al teléfono elegido. La aplicación verifica propiedad local; la aceptación del proveedor se confirma durante el envío.
- `GET /tokens/phone/:phoneId`: metadatos y banderas de configuración, nunca secretos. `GET|PUT|DELETE /tokens/:id` también comprueban propietario y ocultan secretos.
- Eliminar un número de usuario elimina sus credenciales asociadas. Un número con credenciales no puede cambiar de identidad; agregar un número nuevo y configurarlo evita reutilizar credenciales por accidente.
- `POST /message`: requiere `sourcePhoneId`, `requestId` (UUID nuevo para cada envío), asunto, contenido y entre 1 y 100 contactos distintos. En multipart, `contacts` es un array JSON. Se comprueban todos los destinatarios antes de enviar. Se usa el primer teléfono del contacto, conservando el comportamiento existente; números de destino repetidos se envían una sola vez.

Los errores de validación devuelven 400, autenticación 401, autorización 403/404, duplicados 409 y credenciales ausentes 422. Los permisos de ruta siguen siendo necesarios, además de la comprobación de propietario.

## Preparar una base existente

1. Respaldar MongoDB y detener todos los procesos que escriben teléfonos, tokens o mensajes. Usar el mismo `DB_HOST` de la API: la base de datos de aplicación es la indicada en esa URI; `DB_NAME` corresponde al almacén de sesiones.
2. Ejecutar `npm run migrate:phones`. El modo predeterminado solo audita. Informa IDs de números inválidos/duplicados, tokens duplicados y tokens vinculados a propietarios incorrectos; no imprime teléfonos ni secretos.
3. Corregir los IDs informados con revisión de datos. La migración no fusiona ni elimina registros automáticamente. Las credenciales antiguas sin `phone` se cuentan, pero no se asignan por suposición.
4. Ejecutar `npm run migrate:phones -- --apply`. Normaliza números conservando IDs y crea los índices únicos `unique_owner_phone`, `unique_owner_phone_token` y `unique_sender_request`. El proceso es repetible. Si falla, mantener escritores detenidos, resolver la causa y volver a auditar. No usar `syncIndexes` ni eliminar otros índices.
5. Desplegar backend y frontend juntos. Reconfigurar en el perfil los tokens antiguos sin teléfono asociado. El envío ya no utiliza un token global como respaldo.
6. Con credenciales de prueba de Meta, agregar dos números, configurar cada uno y enviar al mismo contacto seleccionando cada emisor. Verificar ambos números e IDs de proveedor. Probar con dos cuentas que los IDs ajenos sean inaccesibles.

La migración no se ejecuta automáticamente contra una base real durante las pruebas del repositorio.

## Entrega y reintentos

El mensaje y sus destinatarios se guardan antes de enviar. El resultado por número distingue `pending`, `sending`, `accepted`, `rejected` y `unknown`. `accepted` significa que Meta aceptó la solicitud; no confirma entrega ni lectura. El historial muestra aceptación parcial y resultados individuales. Los mensajes antiguos conservan su historial y muestran que no tienen confirmación.

Repetir el mismo `requestId` del mismo usuario devuelve el registro existente sin volver a enviar. El índice único cubre solicitudes concurrentes. Si se pierde la respuesta HTTP, conservar ese UUID para consultar/reintentar la misma solicitud. No generar otro automáticamente. Si un proceso termina durante un envío, `sending`/`unknown` requiere revisión antes de reenviar; no hay reintentos automáticos ni recuperación por un worker. Para volúmenes altos se necesita una cola y conciliación de estados del webhook.

El registro de auditoría oculta claves de contraseñas, secretos, cookies, autorización y tokens de forma recursiva. Los registros históricos ya guardados no se reescriben: si contienen credenciales, aplicar la política de retención y rotarlas antes del despliegue.

## Verificación local

Backend: `npm test`. Frontend: `npm test -- --watch=false` y `npm run build`. Las pruebas simulan proveedores y persistencia; no sustituyen la prueba de integración con MongoDB real y Meta en el entorno de despliegue.
