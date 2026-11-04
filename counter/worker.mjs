const allowedOrigins = new Set(['https://kindwerley.com', 'https://www.kindwerley.com']);
const allowedHosts = new Set(['kindwerley.com', 'www.kindwerley.com']);
const weatherCache = typeof caches === 'undefined' ? null : caches.default;

function json(body, status = 200, cacheControl = 'no-store') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function roundedCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
}

function classifyWeather(slot) {
  const symbol = String(
    slot?.data?.next_1_hours?.summary?.symbol_code ||
    slot?.data?.next_6_hours?.summary?.symbol_code ||
    slot?.data?.next_12_hours?.summary?.symbol_code || ''
  ).toLowerCase();
  const cloud = Number(slot?.data?.instant?.details?.cloud_area_fraction);
  const precipitation = Number(slot?.data?.next_1_hours?.details?.precipitation_amount);

  if (symbol.includes('thunder')) return 'storm';
  if (symbol.includes('snow')) return 'cloudy';
  if (symbol.includes('rain') || symbol.includes('sleet') || precipitation > 0.2) return 'rain';
  if (symbol.includes('cloud') || symbol.includes('fog')) return 'cloudy';
  if (symbol.includes('clearsky') || symbol.includes('fair')) return 'clear';
  return Number.isFinite(cloud) && cloud >= 60 ? 'cloudy' : 'clear';
}

function cacheLifetime(response) {
  const cacheControl = response.headers.get('cache-control') || '';
  if (/\b(no-store|no-cache)\b/i.test(cacheControl)) return 0;

  const lifetimes = [];
  const maxAge = /(?:^|,)\s*max-age=(\d+)/i.exec(cacheControl);
  if (maxAge) lifetimes.push(Number(maxAge[1]));

  const expires = Date.parse(response.headers.get('expires') || '');
  if (Number.isFinite(expires)) lifetimes.push(Math.floor((expires - Date.now()) / 1000));

  if (lifetimes.length === 0) return 1800;
  return Math.min(3600, ...lifetimes);
}

async function getWeather(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (!allowedHosts.has(url.hostname) || (origin && !allowedOrigins.has(origin))) {
    return json({ error: 'Forbidden' }, 403);
  }

  const latitude = roundedCoordinate(request.cf?.latitude);
  const longitude = roundedCoordinate(request.cf?.longitude);
  if (latitude === null || longitude === null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return json({ error: 'Weather unavailable' }, 503);
  }

  const cacheUrl = new URL('/__edge-cache/weather', url.origin);
  cacheUrl.searchParams.set('lat', latitude.toFixed(1));
  cacheUrl.searchParams.set('lon', longitude.toFixed(1));
  const cacheKey = new Request(cacheUrl.toString());
  if (weatherCache) {
    try {
      const cached = await weatherCache.match(cacheKey);
      if (cached) return json(await cached.json());
    } catch (_) {
      // A cache read failure should not disable the weather fallback path.
    }
  }

  try {
    const forecastUrl = new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');
    forecastUrl.searchParams.set('lat', latitude.toFixed(1));
    forecastUrl.searchParams.set('lon', longitude.toFixed(1));
    const upstream = await fetch(forecastUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Kindwerley.com weather background (https://kindwerley.com/privacy.html)'
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!upstream.ok) return json({ error: 'Weather unavailable' }, 503);

    const forecast = await upstream.json();
    const slots = forecast?.properties?.timeseries;
    if (!Array.isArray(slots) || slots.length === 0) return json({ error: 'Weather unavailable' }, 503);

    const now = Date.now();
    const slot = slots.reduce((nearest, candidate) => {
      const distance = Math.abs(Date.parse(candidate?.time) - now);
      return Number.isFinite(distance) && distance < nearest.distance
        ? { candidate, distance }
        : nearest;
    }, { candidate: null, distance: Infinity }).candidate;
    if (!slot) return json({ error: 'Weather unavailable' }, 503);

    const result = {
      condition: classifyWeather(slot),
      validAt: slot.time,
      location: { latitude, longitude }
    };
    const lifetime = cacheLifetime(upstream);
    if (weatherCache && lifetime > 30) {
      try {
        await weatherCache.put(cacheKey, json(result, 200, `public, max-age=${lifetime}`));
      } catch (_) {
        // Keep a successful forecast even if this edge cannot store the cache.
      }
    }
    return json(result);
  } catch (_) {
    return json({ error: 'Weather unavailable' }, 503);
  }
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/weather') {
      if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
      return getWeather(request);
    }

    if (pathname !== '/api/visits') return json({ error: 'Not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!allowedOrigins.has(request.headers.get('Origin'))) return json({ error: 'Forbidden' }, 403);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Invalid type' }, 415);

    try {
      const body = await request.text();
      if (body.length > 100) return json({ error: 'Too large' }, 413);
      const { id } = JSON.parse(body);
      if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return json({ error: 'Invalid ID' }, 400);
      const result = await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO visits (id) VALUES (?)').bind(id),
        env.DB.prepare('SELECT total FROM counter WHERE id = 1')
      ]);
      return json({ total: result[1].results[0].total });
    } catch (_) {
      return json({ error: 'Unavailable' }, 503);
    }
  }
};
