# Weather-aware sky background

The homepage and privacy page share the same background renderer. The default sky remains the original time-based scene, calculated locally using the device date and IANA time zone. If the same-origin `/api/weather` endpoint responds with a supported condition, the renderer uses one of the static scenes in `assets/sky/weather-v1/` and crossfades between night, dawn, day, and sunset as the local solar scene changes.

Weather is fetched by the existing Cloudflare Worker from MET Norway's Locationforecast API. Cloudflare's approximate connection geolocation is rounded to one decimal place before the upstream request; no browser GPS permission is requested. The Worker caches its summarized response at the edge using the provider's freshness headers, capped at one hour. The Worker returns the rounded coordinates to the page only for its solar-time calculation; they stay in page memory and are not persisted by the site. The policy page discloses this data flow and attributes MET Norway under the CC BY 4.0 license.

If approximate coordinates, weather data, or an image are unavailable, `sky.js` uses the original background. Weather scenes are illustrative images, not a live forecast or safety product. The preview override `?weather=storm&scene=night` works with `clear`, `cloudy`, `rain` and the day parts `night`, `dawn`, `day`, `sunset`.

`sky-clock.js` is the canonical source, inlined into each HTML `<script id="sky-clock">` to avoid a blocking request. Regenerate those blocks after changes. Update the `sky.js` query version in the five home pages and `privacy.html` when changing the renderer. Version image paths if replacing cached files.
