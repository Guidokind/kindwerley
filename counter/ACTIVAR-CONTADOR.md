# Contador y fondos meteorológicos

El sitio consulta por POST `/api/visits` para el contador y por GET `/api/weather` para elegir el fondo meteorológico. Ambas rutas usan el mismo Worker `kindwerley-counter`. No se debe reemplazar una base existente ni reiniciar el contador al actualizar el Worker.

1. En Cloudflare, localizar el Worker `kindwerley-counter` y la base D1 `kindwerley-visits`. Si no existen, crearlos.
2. Solo al preparar la base, ejecutar `schema.sql` en la consola D1. Las instrucciones son idempotentes y conservan el total existente.
3. Publicar la versión actual de `worker.mjs` en el Worker y conservar el binding D1 con nombre `DB` que apunta a la base correcta.
4. Mantener la ruta existente `kindwerley.com/api/visits` y agregar `kindwerley.com/api/weather` al mismo Worker. Agregar las rutas `www.kindwerley.com/api/visits` y `www.kindwerley.com/api/weather` únicamente si `www` sirve el sitio sin redireccionar. El DNS de estas rutas debe pasar por Cloudflare.
5. Abrir el sitio: el contador aparece si la API responde con un total válido. El fondo usa escenas meteorológicas cuando `/api/weather` responde correctamente; si no, mantiene el fondo anterior.

## Datos meteorológicos

El Worker usa la ubicación aproximada de Cloudflare (`request.cf`) y redondea latitud y longitud a 0,1° antes de consultar la API pública Locationforecast de MET Norway. No se necesita una clave ni otro binding. El navegador no pide permiso de GPS y el proveedor recibe las coordenadas redondeadas desde el Worker, no la ubicación GPS del visitante.

El Worker almacena una respuesta resumida en la caché de borde, respetando la vigencia indicada por el proveedor y con un máximo de una hora. Las coordenadas redondeadas forman parte de la clave de esa caché; no se guardan en D1 ni en almacenamiento persistente. La respuesta al navegador lleva `Cache-Control: no-store`.

El `User-Agent` identifica `kindwerley.com`. La política de privacidad atribuye los datos a MET Norway e incluye un enlace a la licencia CC BY 4.0; el fondo se describe como escena ilustrativa derivada de esos datos. Si faltan ubicación, respuesta o imagen, el sitio conserva su cielo calculado localmente.

El navegador guarda un identificador aleatorio en `sessionStorage`. Se reutiliza durante la sesión y se renueva tras 30 minutos de inactividad entre cargas. Cambiar de idioma no debe duplicar esa visita. La base almacena identificadores y el total, no personas identificadas. No es una medición de visitantes únicos ni incluye protección contra tráfico automatizado.

La configuración y publicación de Cloudflare no se actualizan automáticamente al cambiar estos archivos en GitHub. La publicación del Worker y la incorporación de la ruta meteorológica son pasos manuales.
