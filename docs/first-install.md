# Primera instalación en un servidor vacío

Esta guía corresponde al backend `megaphone-msgr-api` y al frontend `megaphone-msgr-ngFE`. No importes los archivos de `db/`: son exportaciones con IDs y datos de una instalación anterior, no un instalador.

## Qué necesitas

- Node.js 24 o superior y npm 10 o superior en el servidor.
- MongoDB en replica set o un clúster compatible con transacciones, con una base nueva y credenciales propias de la aplicación. Un MongoDB standalone no admite la instalación transaccional. Un replica set de un solo nodo sirve para desarrollo; producción necesita respaldos y una configuración acorde a su disponibilidad.
- Un dominio y HTTPS. Un servidor web publica el frontend y reenvía `/api/` al backend. MongoDB y el puerto del backend no deben quedar accesibles desde Internet.

## 1. Configurar el backend

Ejecuta `npm ci --omit=dev` en el repositorio del backend. La instalación de producción no necesita el MongoDB temporal usado por las pruebas. Copia `.env.example` a `.env` en el servidor y completa:

```dotenv
NODE_ENV=production
PORT=3000
CLUSTER_ENABLED=false
DB_HOST=mongodb://USUARIO:CONTRASENA@HOST:27017/megaphone?replicaSet=rs0&authSource=admin
DB_NAME=megaphone
FRONTEND_URL=https://TU-DOMINIO
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY=CLAVE_HEXADECIMAL_DE_64_CARACTERES
SESSION_SECRET=SECRETO_ALEATORIO_DE_AL_MENOS_32_CARACTERES
```

Los valores anteriores son marcadores: sustituye la URI completa por la que corresponda a tu MongoDB. La base de datos de la aplicación es la de `DB_HOST`; `DB_NAME` es la base de sesiones y puede coincidir con ella, como en el ejemplo. Si usas bases distintas, la cuenta de MongoDB necesita acceso a ambas. Codifica caracteres especiales del usuario o contraseña de la URI según las instrucciones de tu proveedor.

Genera los dos secretos por separado en una terminal privada del servidor:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Guarda sus salidas en `ENCRYPTION_KEY` y `SESSION_SECRET`. Protege el archivo para que solo lo lea la cuenta del servicio; no lo subas a Git ni al frontend. Conserva la clave de cifrado en un respaldo seguro: cambiarla sin migrar los datos impide recuperar las credenciales cifradas.

WhatsApp, SMTP, Cloudinary y TinyPNG no son necesarios para crear el administrador. Si configuras archivos adjuntos o webhooks, completa los grupos de variables correspondientes; la validación del servidor exige que cada grupo esté completo.

## 2. Ejecutar el instalador

Con el backend todavía detenido, ejecuta desde su repositorio:

```sh
npm run setup
```

El comando pide nombre, apellido, email y una contraseña de al menos 12 caracteres, hasta 72 bytes en UTF-8 y sin espacios en sus extremos. La contraseña y su confirmación se leen sin mostrarse en la terminal.

El instalador crea las colecciones e índices y, en una transacción, los estados, permisos, administrador activo, email de acceso y asignaciones. La cuenta no tiene contraseña predeterminada. Un fallo en la transacción no deja un administrador creado a medias. Los índices pueden existir aunque la transacción falle; vuelve a ejecutar el comando después de resolver la causa.

Una segunda ejecución verifica los catálogos y conserva la cuenta, contraseña y permisos existentes. Dos instaladores simultáneos no deben producir dos administradores. No existe una ruta HTTP para crear el primer administrador.

Para despliegues automatizados puedes suministrar `SETUP_ADMIN_NAME`, `SETUP_ADMIN_LAST_NAME`, `SETUP_ADMIN_EMAIL` y `SETUP_ADMIN_PASSWORD` mediante el gestor de secretos del despliegue. Evita escribir contraseñas en argumentos o en el historial de la terminal; retira esas variables al terminar. No hacen falta en ejecuciones posteriores.

Si la base ya contiene usuarios y no tiene registro de instalación, el comando se detiene: no elige ni promueve una cuenta antigua automáticamente. Esta guía es para una base vacía. Para una instalación anterior, revisa duplicados y prepara una migración de cuentas y permisos; no borres usuarios ni reutilices este instalador como recuperación de contraseñas.

## 3. Publicar frontend y backend

En el frontend ejecuta:

```sh
npm ci
npm test -- --watch=false
npm run build
```

Publica el contenido de `dist/megaphone-msgr-ngFE/browser/` como archivos estáticos. El servidor web debe devolver `index.html` para rutas del frontend como `/login` y `/dashboard/setup`. El build de producción usa `/api` y no contiene secretos del backend.

En el proxy configura:

- HTTPS con un certificado válido para tu dominio.
- `/api/` hacia el backend, quitando ese prefijo. Por ejemplo, `/api/auth/login` debe llegar a `/auth/login`.
- Encabezados `Host`, `X-Forwarded-Proto` y `X-Forwarded-For`. La aplicación confía en un salto de proxy: el backend debe ser accesible solo a través de ese proxy.
- Un límite de cuerpo suficiente para adjuntos de hasta 16 MB más el formulario; por ejemplo, 20 MB.
- `/api/webhooks/whatsapp` sin alterar el cuerpo ni su encabezado de firma, si habilitas eventos de Meta.
- Tiempo suficiente para los envíos actuales, que son síncronos. Si el navegador pierde la respuesta, conserva el identificador de solicitud y consulta el historial antes de enviar una solicitud nueva.

Inicia el backend con `npm start` mediante el supervisor del servidor, con reinicio al fallar y al arrancar el sistema. Usa una cuenta de servicio sin privilegios administrativos. La respuesta de `/api/health` será 200 con `{"status":"ok"}` cuando MongoDB esté conectado y 503 si no lo está; este endpoint no afirma que Meta o SMTP funcionen.

No uses `ng serve` ni `npm run dev` para publicar en producción. No abras MongoDB o el puerto 3000 al público. Configura y prueba respaldos y restauración antes de cargar información real.

## 4. Completar la configuración en el navegador

1. Abre `https://TU-DOMINIO/login` y usa el email y contraseña que creaste.
2. La primera sesión abre el asistente. Revisa tu cuenta y agrega tus teléfonos.
3. Para cada emisor, introduce en el asistente las credenciales de WhatsApp Business correspondientes a ese número en Meta. El software no crea ni aprueba cuentas de Meta por ti.
4. Configura SMTP desde Mi perfil si vas a usar email. Es opcional y no afecta al inicio de sesión.
5. Crea un contacto de prueba con un teléfono autorizado y prepara un envío desde el formulario normal. Ningún paso del asistente envía mensajes automáticamente.
6. Revisa el historial. “Aceptado por WhatsApp” confirma la aceptación de la solicitud por Meta, no la entrega ni lectura.

Puedes elegir “Guardar y continuar más tarde” aunque falten canales o contactos. Esto conserva la decisión por usuario; no marca las integraciones pendientes como listas. Vuelve desde **Configuración** para revisar estado o abrir el asistente de nuevo.

Los usuarios que cree el administrador reciben un estado activo y permisos operativos explícitos, incluido su perfil. No reciben administración de usuarios ni lectura de auditoría automáticamente. Cada cuenta configura sus propios números y canales.

## Verificar antes de abrir al público

- Probar instalación sobre una base vacía, login del administrador y segunda ejecución sin cambios de contraseña.
- Crear un usuario operativo y comprobar que puede entrar a su perfil y configurar su cuenta, sin administrar usuarios.
- Probar dos emisores de WhatsApp y una cuenta sin canales; comprobar que no se permite enviar desde un número sin configurar.
- Verificar HTTPS, cookies de sesión, reinicio del servicio y restauración del respaldo.

`npm test` incluye pruebas con un replica set local temporal creado por `mongodb-memory-server`: la primera ejecución descarga MongoDB al caché de pruebas, puede tardar y necesita espacio y acceso a Internet. Las pruebas no leen `.env` ni se conectan a tu base. Para instalación y cuentas se verifican transacciones, repetición, concurrencia y rollback. La aceptación real de Meta y SMTP se comprueba por separado con tus credenciales de prueba.
