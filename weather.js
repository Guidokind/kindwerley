(() => {
  'use strict';

  const root = document.documentElement;
  const button = document.getElementById('weather-toggle');
  const label = button?.querySelector('.weather-toggle__label');
  const status = document.getElementById('weather-status');
  const STORAGE_KEY = 'kindwerley-local-weather';

  const presets = {
    clear: {
      cloudAdd: 0, cloudBrightness: 1, saturation: 1,
      overcast: 0, fog: 0, rain: 0, snow: 0, storm: 0, dim: 0
    },
    cloudy: {
      cloudAdd: .20, cloudBrightness: .92, saturation: .91,
      overcast: .08, fog: 0, rain: 0, snow: 0, storm: 0, dim: .03
    },
    overcast: {
      cloudAdd: .43, cloudBrightness: .67, saturation: .74,
      overcast: .48, fog: .02, rain: 0, snow: 0, storm: 0, dim: .16
    },
    fog: {
      cloudAdd: .31, cloudBrightness: .84, saturation: .66,
      overcast: .18, fog: .64, rain: 0, snow: 0, storm: 0, dim: .09
    },
    drizzle: {
      cloudAdd: .36, cloudBrightness: .69, saturation: .72,
      overcast: .39, fog: .14, rain: .24, snow: 0, storm: 0, dim: .15
    },
    rain: {
      cloudAdd: .48, cloudBrightness: .56, saturation: .62,
      overcast: .58, fog: .12, rain: .55, snow: 0, storm: 0, dim: .23
    },
    snow: {
      cloudAdd: .44, cloudBrightness: .82, saturation: .62,
      overcast: .34, fog: .25, rain: 0, snow: .66, storm: 0, dim: .13
    },
    storm: {
      cloudAdd: .57, cloudBrightness: .42, saturation: .54,
      overcast: .72, fog: .08, rain: .72, snow: 0, storm: .92, dim: .34
    }
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const setButton = ({ text, pressed = false, loading = false, disabled = false }) => {
    if (!button || !label) return;
    label.textContent = text;
    button.setAttribute('aria-pressed', String(pressed));
    button.classList.toggle('is-loading', loading);
    button.disabled = disabled;
  };

  const applyPreset = (name, intensity = 1, windSpeed = 10) => {
    const preset = presets[name] || presets.clear;
    const factor = clamp(intensity, .25, 1);

    root.style.setProperty('--weather-cloud-add', (preset.cloudAdd * factor).toFixed(3));
    root.style.setProperty('--weather-cloud-brightness', (1 - (1 - preset.cloudBrightness) * factor).toFixed(3));
    root.style.setProperty('--weather-saturation', (1 - (1 - preset.saturation) * factor).toFixed(3));
    root.style.setProperty('--weather-overcast', (preset.overcast * factor).toFixed(3));
    root.style.setProperty('--weather-fog', (preset.fog * factor).toFixed(3));
    root.style.setProperty('--weather-rain', (preset.rain * factor).toFixed(3));
    root.style.setProperty('--weather-snow', (preset.snow * factor).toFixed(3));
    root.style.setProperty('--weather-storm', (preset.storm * factor).toFixed(3));
    root.style.setProperty('--weather-dim', (preset.dim * factor).toFixed(3));

    const wind = clamp(Number(windSpeed) || 0, 0, 80);
    const windFactor = 1 - (wind / 80) * .62;
    root.style.setProperty('--cloud-far-duration', `${Math.round(115 * windFactor)}s`);
    root.style.setProperty('--cloud-near-duration', `${Math.round(82 * windFactor)}s`);
    root.style.setProperty('--rain-speed', `${Math.round(820 - wind * 4.5)}ms`);

    root.classList.toggle('weather-storm', name === 'storm');
    root.dataset.weather = name;
  };

  const classifyWeather = (current) => {
    const code = Number(current.weather_code ?? 0);
    const cloudCover = clamp(Number(current.cloud_cover ?? 0), 0, 100);
    const precipitation = Math.max(0, Number(current.precipitation ?? 0));
    const rain = Math.max(0, Number(current.rain ?? 0), Number(current.showers ?? 0));
    const snowfall = Math.max(0, Number(current.snowfall ?? 0));

    if (code >= 95) return { name: 'storm', intensity: clamp(.72 + precipitation / 6) };
    if ((code >= 71 && code <= 77) || code >= 85 && code <= 86 || snowfall > 0) {
      return { name: 'snow', intensity: clamp(.48 + snowfall / 2.5) };
    }
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82) || rain > .25) {
      return { name: 'rain', intensity: clamp(.48 + Math.max(rain, precipitation) / 5) };
    }
    if (code >= 51 && code <= 57 || precipitation > 0) {
      return { name: 'drizzle', intensity: clamp(.42 + precipitation / 2.5) };
    }
    if (code === 45 || code === 48) return { name: 'fog', intensity: .86 };
    if (code === 3 || cloudCover >= 78) {
      return { name: 'overcast', intensity: clamp(.58 + cloudCover / 240) };
    }
    if (code === 2 || cloudCover >= 35) {
      return { name: 'cloudy', intensity: clamp(.40 + cloudCover / 150) };
    }
    return { name: 'clear', intensity: .35 };
  };

  const fetchWeather = async (latitude, longitude) => {
    const params = new URLSearchParams({
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      current: 'weather_code,cloud_cover,precipitation,rain,showers,snowfall,wind_speed_10m',
      timezone: 'auto'
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
    const data = await response.json();
    if (!data.current) throw new Error('Weather response did not include current conditions.');
    return data.current;
  };

  const getPosition = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 9000,
      maximumAge: 10 * 60 * 1000
    });
  });

  const activateLocalWeather = async ({ remember = true } = {}) => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setButton({ text: 'Weather unavailable', disabled: true });
      setStatus('Local weather is unavailable in this browser.');
      return;
    }

    setButton({ text: 'Locating', loading: true });
    setStatus('Requesting your approximate location for local weather.');

    try {
      const position = await getPosition();
      setButton({ text: 'Loading weather', loading: true });

      const current = await fetchWeather(position.coords.latitude, position.coords.longitude);
      const condition = classifyWeather(current);
      applyPreset(condition.name, condition.intensity, current.wind_speed_10m);

      if (remember) localStorage.setItem(STORAGE_KEY, 'enabled');
      setButton({ text: 'Weather live', pressed: true });
      setStatus(`Local weather is active: ${condition.name}.`);
    } catch (error) {
      const denied = error && error.code === 1;
      if (denied) localStorage.removeItem(STORAGE_KEY);
      setButton({ text: denied ? 'Location blocked' : 'Try local weather' });
      setStatus(denied
        ? 'Location permission was not granted. The time-based sky remains active.'
        : 'Local weather could not be loaded. The time-based sky remains active.');
      console.warn('[weather]', error);
    }
  };

  const parseWeatherOverride = () => {
    const raw = new URLSearchParams(window.location.search).get('weather');
    if (!raw) return null;
    const value = raw.toLowerCase();
    return Object.prototype.hasOwnProperty.call(presets, value) ? value : null;
  };

  const init = async () => {
    const override = parseWeatherOverride();
    if (override) {
      applyPreset(override, 1, override === 'storm' ? 48 : 18);
      setButton({ text: `Demo · ${override}`, pressed: true, disabled: true });
      setStatus(`Weather demo active: ${override}.`);
      return;
    }

    if (!button) return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => activateLocalWeather({ remember: true }));

    if (!navigator.geolocation || !window.isSecureContext) {
      setButton({ text: 'Weather unavailable', disabled: true });
      return;
    }

    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          activateLocalWeather({ remember: true });
          return;
        }
        if (permission.state === 'denied') {
          setButton({ text: 'Location blocked' });
          return;
        }
      }
    } catch (_) {
      // Some browsers implement geolocation without exposing its permission state.
    }

    if (localStorage.getItem(STORAGE_KEY) === 'enabled') {
      activateLocalWeather({ remember: true });
    }
  };

  applyPreset('clear', .25, 10);
  init();
})();
