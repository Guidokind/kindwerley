# Guido Kindwerley — Dynamic Sky v1

Minimal personal website for kindwerley.com.

## Dynamic background

The background uses the visitor's local device time and continuously interpolates between:

- Night
- Dawn
- Morning
- Midday
- Late afternoon
- Sunset
- Dusk

It is built entirely with HTML, CSS and JavaScript. No geolocation permission, weather API, images or video are required.

## Test a specific time

Add `?time=` to the URL:

- `/?time=6:00`
- `/?time=12:00`
- `/?time=18:30`
- `/?time=23:00`

Decimal values also work, such as `/?time=19.5`.

## Files

- `index.html` — content, metadata and structured data
- `style.css` — sky, clouds, stars and typography
- `sky.js` — local-time interpolation

## Deployment

Upload all files to the root of the GitHub repository. GitHub Pages and Cloudflare can continue using the existing configuration.
