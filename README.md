# kindwerley.com

Página personal de Guido Kindwerley, cofundador de Wingsburg y piloto comercial.

## Publicar la actualización

1. Descomprimir el ZIP.
2. Subir **el contenido** de la carpeta kindwerley-main a la raíz del repositorio existente en GitHub, reemplazando los archivos anteriores. Incluir las carpetas es, pt, fr e it.
3. Conservar CNAME y la configuración actual de GitHub Pages. No hace falta instalar ni compilar nada.
4. Esperar a que finalice el despliegue y recargar el sitio con Ctrl+F5.

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


## Actualizaciones y privacidad

Al cambiar style.css o site-ui.js, actualizar su parámetro `v` en las cinco páginas para renovar la caché. El aviso bilingüe de privacidad está en privacy.html.
