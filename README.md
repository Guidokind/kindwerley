# kindwerley.com

Página personal de Guido Kindwerley, cofundador de Wingsburg y piloto comercial.

## Publicar la actualización

El sitio se publica desde la rama `main` con GitHub Pages. Al integrar cambios en esa rama, GitHub actualiza las páginas estáticas; no hace falta instalar dependencias ni compilar.

## Idiomas

- Inglés: https://kindwerley.com/
- Español: https://kindwerley.com/es/
- Portugués: https://kindwerley.com/pt/
- Francés: https://kindwerley.com/fr/
- Italiano: https://kindwerley.com/it/

El selector superior muestra la abreviatura del idioma actual (EN, ES, PT, FR o IT), sin banderas. Al tocarla, se despliegan los otros cuatro idiomas con sus nombres. Funciona sin JavaScript y con teclado; también se cierra al tocar fuera o pulsar Escape cuando JavaScript está disponible. La dirección principal sigue en inglés; no hay redirecciones automáticas. Cada versión incluye su propio título, descripción, idioma, URL canónica, datos estructurados y enlaces hreflang. El sitemap contiene las cinco versiones.

Se conserva el diseño, los enlaces sociales, Clarity y el cielo animado según la hora local. Los recursos visuales y el CSS/JS se comparten entre todos los idiomas. La imagen para compartir enlaces es común y muestra el cielo original sin texto. El título y la descripción del enlace se muestran en el idioma de la página. Se utiliza preview.webp para compartir enlaces.

## Editar

Modificar el index.html correspondiente para cambiar textos de cada idioma. Los estilos están en style.css y el cielo en sky.js. Los cambios de contenido deben aplicarse también a los metadatos de cada página.

## Contador discreto

El contador consulta `/api/visits` y se muestra solo cuando el servicio devuelve un total válido. La configuración del Worker y D1 se documenta en `counter/ACTIVAR-CONTADOR.md`; su despliegue se administra en Cloudflare. Se comparte entre los cinco idiomas.

## Fondos según el clima

Cuando el Worker devuelve condiciones meteorológicas, `sky.js` combina una de las 16 escenas de `assets/sky/weather-v1/` con la franja solar local del dispositivo: noche, amanecer, día o atardecer. La selección consulta MET Norway mediante el Worker existente; no usa una clave de API ni pide permiso de GPS. Cloudflare aporta una ubicación aproximada derivada de la conexión, que el Worker redondea a 0,1° antes de consultar el clima. Si no hay coordenadas, datos o una escena cargable, queda activo el fondo anterior.

Para habilitar el clima real, publicar `counter/worker.mjs` en el Worker existente, conservar el binding D1 `DB` y añadir la ruta `kindwerley.com/api/weather` sin quitar `kindwerley.com/api/visits`. Los pasos completos están en `counter/ACTIVAR-CONTADOR.md`. En una URL de prueba se puede forzar una escena con `?weather=storm&scene=night` (también `clear`, `cloudy` o `rain`, y `dawn`, `day` o `sunset`).

La página de privacidad explica el uso de ubicación aproximada y el origen de datos. El enlace discreto “MET Norway” aparece en el pie mientras se usa clima real. Las escenas ilustran condiciones meteorológicas; no son un pronóstico ni información de seguridad.

## Actualizaciones y privacidad

Al cambiar `sky.js`, actualizar su parámetro `v` en las cinco páginas y en `privacy.html` para renovar la caché. `tools/sync-inline-css.py` mantiene el CSS compartido en esas seis páginas. El aviso bilingüe de privacidad está en `privacy.html`.
