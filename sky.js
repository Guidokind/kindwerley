(() => {
  'use strict';

  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const stops = [
    {
      minute: 0,
      top: '#030713', middle: '#09142a', bottom: '#18233a',
      stars: 0.94, sun: 0, sunX: 48, sunY: 115,
      horizon: [66, 88, 122], horizonOpacity: 0.10,
      clouds: 0.12, cloudBrightness: 0.42, cloudWarmth: [114, 128, 153]
    },
    {
      minute: 270,
      top: '#050b1b', middle: '#142340', bottom: '#554861',
      stars: 0.72, sun: 0, sunX: 36, sunY: 106,
      horizon: [182, 116, 126], horizonOpacity: 0.22,
      clouds: 0.16, cloudBrightness: 0.48, cloudWarmth: [160, 133, 153]
    },
    {
      minute: 345,
      top: '#102849', middle: '#6e607a', bottom: '#f19872',
      stars: 0.34, sun: 0.34, sunX: 28, sunY: 85,
      horizon: [255, 155, 108], horizonOpacity: 0.52,
      clouds: 0.24, cloudBrightness: 0.78, cloudWarmth: [241, 161, 138]
    },
    {
      minute: 405,
      top: '#2a6291', middle: '#98a9bd', bottom: '#f4c293',
      stars: 0.04, sun: 0.64, sunX: 30, sunY: 67,
      horizon: [255, 196, 137], horizonOpacity: 0.39,
      clouds: 0.27, cloudBrightness: 0.98, cloudWarmth: [250, 199, 161]
    },
    {
      minute: 510,
      top: '#2476b3', middle: '#78b7dc', bottom: '#d8edf5',
      stars: 0, sun: 0.78, sunX: 40, sunY: 31,
      horizon: [210, 238, 248], horizonOpacity: 0.18,
      clouds: 0.23, cloudBrightness: 1.08, cloudWarmth: [226, 239, 246]
    },
    {
      minute: 720,
      top: '#0878be', middle: '#64b8df', bottom: '#d9f0f6',
      stars: 0, sun: 0.86, sunX: 67, sunY: 15,
      horizon: [210, 240, 248], horizonOpacity: 0.16,
      clouds: 0.20, cloudBrightness: 1.12, cloudWarmth: [231, 242, 248]
    },
    {
      minute: 990,
      top: '#246da7', middle: '#77abc9', bottom: '#efb777',
      stars: 0, sun: 0.72, sunX: 75, sunY: 38,
      horizon: [255, 189, 112], horizonOpacity: 0.30,
      clouds: 0.26, cloudBrightness: 1.01, cloudWarmth: [242, 193, 157]
    },
    {
      minute: 1110,
      top: '#25426c', middle: '#bd6a75', bottom: '#ffad68',
      stars: 0.06, sun: 0.56, sunX: 78, sunY: 72,
      horizon: [255, 142, 95], horizonOpacity: 0.56,
      clouds: 0.29, cloudBrightness: 0.86, cloudWarmth: [239, 145, 128]
    },
    {
      minute: 1200,
      top: '#0b1730', middle: '#343653', bottom: '#875b6b',
      stars: 0.46, sun: 0.08, sunX: 80, sunY: 94,
      horizon: [190, 104, 110], horizonOpacity: 0.28,
      clouds: 0.19, cloudBrightness: 0.60, cloudWarmth: [157, 126, 145]
    },
    {
      minute: 1290,
      top: '#040a19', middle: '#111d35', bottom: '#273047',
      stars: 0.88, sun: 0, sunX: 82, sunY: 110,
      horizon: [83, 103, 132], horizonOpacity: 0.12,
      clouds: 0.13, cloudBrightness: 0.45, cloudWarmth: [118, 130, 151]
    },
    {
      minute: 1440,
      top: '#030713', middle: '#09142a', bottom: '#18233a',
      stars: 0.94, sun: 0, sunX: 48, sunY: 115,
      horizon: [66, 88, 122], horizonOpacity: 0.10,
      clouds: 0.12, cloudBrightness: 0.42, cloudWarmth: [114, 128, 153]
    }
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);

  const hexToRgb = (hex) => {
    const value = hex.replace('#', '');
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ];
  };

  const rgbToHex = (rgb) => `#${rgb
    .map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0'))
    .join('')}`;

  const mixColor = (from, to, t) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return rgbToHex(a.map((value, index) => lerp(value, b[index], t)));
  };

  const mixArray = (from, to, t) => from.map((value, index) => Math.round(lerp(value, to[index], t)));

  const parseTimeOverride = () => {
    const raw = new URLSearchParams(window.location.search).get('time');
    if (!raw) return null;

    if (/^\d{1,2}:\d{1,2}$/.test(raw)) {
      const [hours, minutes] = raw.split(':').map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return hours * 60 + minutes;
      }
    }

    const decimalHours = Number(raw);
    if (Number.isFinite(decimalHours) && decimalHours >= 0 && decimalHours < 24) {
      return decimalHours * 60;
    }

    return null;
  };

  const getMinuteOfDay = () => {
    const override = parseTimeOverride();
    if (override !== null) return override;

    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  };

  const getInterpolatedState = (minute) => {
    const currentMinute = clamp(minute, 0, 1439.999);
    let from = stops[0];
    let to = stops[stops.length - 1];

    for (let index = 0; index < stops.length - 1; index += 1) {
      if (currentMinute >= stops[index].minute && currentMinute < stops[index + 1].minute) {
        from = stops[index];
        to = stops[index + 1];
        break;
      }
    }

    const progress = ease((currentMinute - from.minute) / (to.minute - from.minute));

    return {
      top: mixColor(from.top, to.top, progress),
      middle: mixColor(from.middle, to.middle, progress),
      bottom: mixColor(from.bottom, to.bottom, progress),
      stars: lerp(from.stars, to.stars, progress),
      sun: lerp(from.sun, to.sun, progress),
      sunX: lerp(from.sunX, to.sunX, progress),
      sunY: lerp(from.sunY, to.sunY, progress),
      horizon: mixArray(from.horizon, to.horizon, progress),
      horizonOpacity: lerp(from.horizonOpacity, to.horizonOpacity, progress),
      clouds: lerp(from.clouds, to.clouds, progress),
      cloudBrightness: lerp(from.cloudBrightness, to.cloudBrightness, progress),
      cloudWarmth: mixArray(from.cloudWarmth, to.cloudWarmth, progress)
    };
  };

  const applyState = (state) => {
    root.style.setProperty('--sky-top', state.top);
    root.style.setProperty('--sky-middle', state.middle);
    root.style.setProperty('--sky-bottom', state.bottom);
    root.style.setProperty('--stars-opacity', state.stars.toFixed(3));
    root.style.setProperty('--sun-opacity', state.sun.toFixed(3));
    root.style.setProperty('--sun-x', `${state.sunX.toFixed(2)}%`);
    root.style.setProperty('--sun-y', `${state.sunY.toFixed(2)}%`);
    root.style.setProperty('--horizon-color', state.horizon.join(', '));
    root.style.setProperty('--horizon-opacity', state.horizonOpacity.toFixed(3));
    root.style.setProperty('--cloud-opacity', state.clouds.toFixed(3));
    root.style.setProperty('--cloud-brightness', state.cloudBrightness.toFixed(3));
    root.style.setProperty('--cloud-warmth', state.cloudWarmth.join(', '));

    if (themeColor) themeColor.setAttribute('content', state.top);
  };

  const render = () => applyState(getInterpolatedState(getMinuteOfDay()));

  render();

  if (parseTimeOverride() === null) {
    window.setInterval(render, 60_000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) render();
    });
  }
})();
