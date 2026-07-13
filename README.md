# Kindwerley — Dynamic Sky v2

Minimal personal landing page with a continuous sky cycle based on the visitor's local device time.

## New in v2

- Optional local-weather mode using browser geolocation and Open-Meteo current conditions.
- No location prompt on first load: the visitor activates it through the small **Local weather** control.
- The choice is remembered locally after permission is granted.
- Graceful fallback: if permission, connectivity, or the API fails, the time-based sky continues unchanged.
- Subtle visual states for cloud, overcast, fog, drizzle, rain, snow and thunderstorm.

## Time previews

Append `?time=HH:MM` to the URL, for example:

- `?time=06:00`
- `?time=12:00`
- `?time=18:30`
- `?time=23:00`

## Weather previews

Append `?weather=STATE` to test the visual states without location access:

- `clear`
- `cloudy`
- `overcast`
- `fog`
- `drizzle`
- `rain`
- `snow`
- `storm`

Time and weather parameters can be combined, for example:

`?time=18:30&weather=storm`
