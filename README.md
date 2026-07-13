# Kindwerley Premium Sky v4

Landing page package for `kindwerley.com` with premium realistic sky backgrounds and subtle long-duration motion.

## What's new in v4

- Keeps the premium sky system from v3.
- Adds ultra-subtle continuous motion so the background feels alive.
- Main background drift loop: **300 seconds**.
- Secondary cloud haze loop: **210 seconds** and **300 seconds**.
- Gentle breathing / micro zoom loop: **180–210 seconds**.
- Night stars now have a very soft twinkle and faint drift.
- Motion respects `prefers-reduced-motion`.

## Manual scene testing

- `?scene=dawn`
- `?scene=day`
- `?scene=golden`
- `?scene=dusk`
- `?scene=night`

You can also combine it with:

- `?time=06:15`
- `?time=12:00`
- `?time=18:20`
- `?time=23:10`

Examples:

- `https://kindwerley.com/?scene=night`
- `https://kindwerley.com/?time=18:20`

## Files to keep at the repository root

- `index.html`
- `style.css`
- `sky.js`
- `CNAME`
- `preview.jpg`
- `preview.png`
- `assets/sky/...`

## Upload note

Replace the site contents with the files in this package. Do not upload the ZIP itself into the repository.
