(() => {
  'use strict';

  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const layerA = document.querySelector('.sky-photo--a');
  const layerB = document.querySelector('.sky-photo--b');
  const mobileQuery = window.matchMedia('(max-width: 680px)');
  const imageCache = new Map();
  let renderVersion = 0;

  const scenes = [
    { minute: 0, key: 'night', theme: '#050913', dim: .12, tint: [5, 12, 26] },
    { minute: 270, key: 'night', theme: '#07101e', dim: .11, tint: [8, 18, 34] },
    { minute: 335, key: 'dawn', theme: '#bcc7d2', dim: .03, tint: [69, 92, 122] },
    { minute: 420, key: 'dawn', theme: '#d6dce1', dim: .02, tint: [107, 128, 151] },
    { minute: 485, key: 'day', theme: '#087ac0', dim: .02, tint: [28, 92, 137] },
    { minute: 975, key: 'day', theme: '#087ac0', dim: .03, tint: [24, 83, 126] },
    { minute: 1040, key: 'golden', theme: '#e79858', dim: .04, tint: [132, 69, 34] },
    { minute: 1125, key: 'golden', theme: '#d7784d', dim: .05, tint: [118, 56, 40] },
    { minute: 1185, key: 'dusk', theme: '#6a5a7d', dim: .07, tint: [72, 50, 86] },
    { minute: 1260, key: 'dusk', theme: '#302944', dim: .10, tint: [40, 34, 61] },
    { minute: 1320, key: 'night', theme: '#060b17', dim: .12, tint: [7, 14, 29] },
    { minute: 1440, key: 'night', theme: '#050913', dim: .12, tint: [5, 12, 26] }
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const mixArray = (from, to, t) => from.map((value, index) => Math.round(lerp(value, to[index], t)));

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

  const getScenePair = (minute) => {
    const currentMinute = clamp(minute, 0, 1439.999);
    let from = scenes[0];
    let to = scenes[scenes.length - 1];

    for (let index = 0; index < scenes.length - 1; index += 1) {
      if (currentMinute >= scenes[index].minute && currentMinute < scenes[index + 1].minute) {
        from = scenes[index];
        to = scenes[index + 1];
        break;
      }
    }

    const span = Math.max(1, to.minute - from.minute);
    const progress = ease((currentMinute - from.minute) / span);
    return { from, to, progress };
  };

  const imageUrl = (key) => `/assets/sky/${key}${mobileQuery.matches ? '-mobile' : ''}.webp`;

  const preload = (url) => {
    if (!imageCache.has(url)) {
      imageCache.set(url, new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(url);
        image.onerror = reject;
        image.src = url;
      }));
    }
    return imageCache.get(url);
  };

  const render = async () => {
    if (!layerA || !layerB) return;
    const version = ++renderVersion;
    const { from, to, progress } = getScenePair(getMinuteOfDay());
    const fromUrl = imageUrl(from.key);
    const toUrl = imageUrl(to.key);

    try {
      await Promise.all([preload(fromUrl), preload(toUrl)]);
    } catch (error) {
      console.warn('[sky] A photographic background could not be loaded.', error);
      return;
    }

    if (version !== renderVersion) return;

    layerA.style.backgroundImage = `url("${fromUrl}")`;
    layerB.style.backgroundImage = `url("${toUrl}")`;
    layerA.style.opacity = fromUrl === toUrl ? '1' : String(1 - progress);
    layerB.style.opacity = fromUrl === toUrl ? '0' : String(progress);

    const tint = mixArray(from.tint, to.tint, progress);
    const theme = mixColor(from.theme, to.theme, progress);
    const dim = lerp(from.dim, to.dim, progress);

    root.style.setProperty('--scene-tint', tint.join(', '));
    root.style.setProperty('--scene-dim', dim.toFixed(3));
    root.dataset.sky = progress < .5 ? from.key : to.key;
    if (themeColor) themeColor.setAttribute('content', theme);
  };

  render();

  if (parseTimeOverride() === null) {
    window.setInterval(render, 60_000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) render();
    });
  }

  const onViewportChange = () => {
    imageCache.clear();
    render();
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onViewportChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(onViewportChange);
  }
})();
