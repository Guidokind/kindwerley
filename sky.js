(() => {
  'use strict';

  const layers = [document.getElementById('sky-a'), document.getElementById('sky-b')];
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const base = './assets/sky/';
  const files = {
    dawn: 'dawn-premium-v3',
    day: 'day-premium-v3',
    golden: 'golden-premium-v3',
    dusk: 'dusk-premium-v3',
    night: 'night-premium-v3'
  };

  const segments = [
    { start: 0,    end: 310,  from: 'night',  to: 'night' },
    { start: 310,  end: 405,  from: 'night',  to: 'dawn' },
    { start: 405,  end: 495,  from: 'dawn',   to: 'day' },
    { start: 495,  end: 975,  from: 'day',    to: 'day' },
    { start: 975,  end: 1060, from: 'day',    to: 'golden' },
    { start: 1060, end: 1150, from: 'golden', to: 'dusk' },
    { start: 1150, end: 1245, from: 'dusk',   to: 'night' },
    { start: 1245, end: 1440, from: 'night',  to: 'night' }
  ];

  const params = new URLSearchParams(window.location.search);
  const forcedScene = params.get('scene');
  const forcedTime = parseForcedTime(params.get('time'));
  let currentFiles = ['', ''];

  function parseForcedTime(value) {
    if (!value) return null;
    const match = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function currentMinute() {
    if (forcedTime !== null) return forcedTime;
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }

  function sceneAt(minute) {
    if (forcedScene && files[forcedScene]) {
      return { from: forcedScene, to: forcedScene, mix: 0 };
    }
    const segment = segments.find(item => minute >= item.start && minute < item.end) || segments[0];
    if (segment.from === segment.to) return { from: segment.from, to: segment.to, mix: 0 };
    return {
      from: segment.from,
      to: segment.to,
      mix: smoothstep((minute - segment.start) / (segment.end - segment.start))
    };
  }

  function fileFor(scene) {
    const suffix = mobileQuery.matches ? '-mobile.webp' : '.webp';
    return `${base}${files[scene]}${suffix}`;
  }

  function preload(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = image.onerror = () => resolve(url);
      image.src = url;
    });
  }

  async function render() {
    const scene = sceneAt(currentMinute());
    const urls = [fileFor(scene.from), fileFor(scene.to)];
    await Promise.all(urls.map(preload));

    urls.forEach((url, index) => {
      if (currentFiles[index] !== url) {
        layers[index].style.backgroundImage = `url("${url}")`;
        currentFiles[index] = url;
      }
    });

    layers[0].style.opacity = String(1 - scene.mix);
    layers[1].style.opacity = String(scene.mix);
    document.documentElement.dataset.sky = scene.mix < 0.5 ? scene.from : scene.to;
  }

  render();
  if (forcedTime === null && !forcedScene) window.setInterval(render, 60_000);
  mobileQuery.addEventListener?.('change', render);

  // Load the remaining local scenes after first paint for instant transitions later.
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      Object.keys(files).forEach(scene => preload(fileFor(scene)));
    }, 900);
  }, { once: true });
})();
