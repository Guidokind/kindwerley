# Regional solar background

The sky uses the device date and IANA timezone, with approximate coordinates of the timezone reference city (IANA tzdb, public domain). It does not determine the actual visitor location, request geolocation permission, call an IP service, or store coordinates. Accuracy varies within large timezones. Unknown zones fall back to local clock hours.

Solar altitude follows NOAA general solar equations. It handles seasons, midnight, polar day/night and daylight-saving time via the device timestamp. `scene` and `time` query overrides remain available for previews. Privacy and all five homepages use the same algorithm.

`sky-clock.js` is the canonical source, inlined into each HTML `<script id="sky-clock">` to avoid a blocking request. Regenerate those blocks after changes. The preload and sky renderer both call `SkyClock.scene()`; update the sky.js query version when changing the renderer. Version image URLs when replacing assets cached for one month.
