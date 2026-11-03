# Contador de visitas

El sitio consulta por POST la ruta /api/visits. No se debe reemplazar una base existente ni reiniciar el contador al actualizar el sitio.

1. En Cloudflare, localizar el Worker kindwerley-counter y la base D1 kindwerley-visits. Si no existen, crearlos.
2. Solo al preparar la base, ejecutar schema.sql en la consola D1. Las instrucciones son idempotentes y conservan el total existente.
3. Publicar worker.mjs en el Worker y añadir un binding D1 con nombre DB que apunte a la base correcta.
4. Configurar la ruta kindwerley.com/api/visits. Agregar www.kindwerley.com/api/visits únicamente si www sirve el sitio sin redireccionar. El DNS de estas rutas debe pasar por Cloudflare.
5. Abrir el sitio: el contador aparece si la API responde con un total válido. Un error lo mantiene oculto.

El navegador guarda un identificador aleatorio en sessionStorage. Se reutiliza durante la sesión y se renueva tras 30 minutos de inactividad entre cargas. Cambiar de idioma no debe duplicar esa visita. La base almacena identificadores y el total, no personas identificadas. No es una medición de visitantes únicos ni incluye protección contra tráfico automatizado.

La configuración y publicación de Cloudflare no se actualizan automáticamente al cambiar estos archivos en GitHub.
