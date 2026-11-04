(() => {
  'use strict';

  const layers = [document.getElementById('sky-a'), document.getElementById('sky-b')];
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const base = new URL('./assets/sky/', document.currentScript.src).href;
  const files = {
    dawn: 'dawn-premium-v3',
    day: 'day-premium-v3',
    golden: 'golden-premium-v3',
    dusk: 'dusk-premium-v3',
    night: 'night-premium-v3'
  };

  const params = new URLSearchParams(window.location.search);
  const forcedScene = params.get('scene');
  const forcedTime = parseForcedTime(params.get('time'));
  const weatherPreview = parseWeather(params.get('weather'));
  const previewTime = parseWeatherTime(forcedScene);
  const weatherCredit = document.querySelector('.weather-credit');
  let currentFiles = ['', ''];
  let weatherData = null;
  let lastWeatherCheck = 0;
  let renderToken = 0;
  let intervalId = null;
  let weatherTimer = null;

  function parseForcedTime(value) {
    if (!value) return null;
    const match = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  function parseWeather(value) {
    return ['clear', 'cloudy', 'rain', 'storm'].includes(value) ? value : null;
  }

  function parseWeatherTime(value) {
    if (value === 'sunset' || value === 'golden' || value === 'dusk') return 'sunset';
    return ['night', 'dawn', 'day'].includes(value) ? value : null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function fileFor(scene) {
    const suffix = mobileQuery.matches ? '-mobile.webp' : '.webp';
    return `${base}${files[scene]}${suffix}`;
  }

  function weatherFile(condition, time) {
    return `${base}weather-v1/${condition}-${time}.webp`;
  }

  function preload(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
  }

  function weightedSceneValue(scene, name) {
    if (scene.from === name && scene.to === name) return 1;
    if (scene.from === name) return 1 - scene.mix;
    if (scene.to === name) return scene.mix;
    return 0;
  }

  function dominantLabel(scene) {
    return scene.mix < 0.5 ? scene.from : scene.to;
  }

  function starVisibility(scene) {
    const night = weightedSceneValue(scene, 'night');
    const dawn = weightedSceneValue(scene, 'dawn');
    const dusk = weightedSceneValue(scene, 'dusk');
    const day = weightedSceneValue(scene, 'day');
    const golden = weightedSceneValue(scene, 'golden');
    return clamp(night * 0.22 + dawn * 0.04 + dusk * 0.08 - day * 0.06 - golden * 0.08, 0, 0.24);
  }

  function backCloudVisibility(scene) {
    const dawn = weightedSceneValue(scene, 'dawn');
    const day = weightedSceneValue(scene, 'day');
    const golden = weightedSceneValue(scene, 'golden');
    const dusk = weightedSceneValue(scene, 'dusk');
    const night = weightedSceneValue(scene, 'night');
    return clamp(0.05 + dawn * 0.01 + day * 0.015 + golden * 0.018 + dusk * 0.012 - night * 0.008, 0.04, 0.09);
  }

  function frontCloudVisibility(scene) {
    const dawn = weightedSceneValue(scene, 'dawn');
    const day = weightedSceneValue(scene, 'day');
    const golden = weightedSceneValue(scene, 'golden');
    const dusk = weightedSceneValue(scene, 'dusk');
    const night = weightedSceneValue(scene, 'night');
    return clamp(0.075 + dawn * 0.015 + day * 0.018 + golden * 0.024 + dusk * 0.018 - night * 0.015, 0.06, 0.12);
  }

  function timeAsset(sceneName) {
    if (sceneName === 'golden' || sceneName === 'dusk') return 'sunset';
    if (['night', 'dawn', 'day'].includes(sceneName)) return sceneName;
    return 'day';
  }

  function setWeatherState(active, showCredit) {
    if (active) document.documentElement.dataset.weatherMode = 'true';
    else delete document.documentElement.dataset.weatherMode;
    if (weatherCredit) weatherCredit.hidden = !showCredit;
  }

  async function render() {
    const token = ++renderToken;
    const weatherCondition = weatherPreview || weatherData?.condition || null;
    const localScene = weatherPreview && previewTime
      ? { from: previewTime, to: previewTime, mix: 0 }
      : weatherData?.location
        ? window.SkyClock.scene(new Date(), weatherData.location)
        : window.SkyClock.scene();
    const scene = weatherCondition ? {
      from: timeAsset(localScene.from),
      to: timeAsset(localScene.to),
      mix: localScene.mix
    } : localScene;
    const urls = weatherCondition
      ? [weatherFile(weatherCondition, scene.from), weatherFile(weatherCondition, scene.to)]
      : [fileFor(scene.from), fileFor(scene.to)];
    const loaded = await Promise.all(urls.map(preload));
    if (token !== renderToken) return;

    if (weatherCondition && loaded.some(success => !success)) {
      if (weatherData) weatherData = null;
      setWeatherState(false, false);
      render();
      return;
    }

    urls.forEach((url, index) => {
      if (currentFiles[index] !== url) {
        layers[index].style.backgroundImage = `url("${url}")`;
        currentFiles[index] = url;
      }
    });

    const firstRender = !document.documentElement.hasAttribute('data-sky-ready');
    layers[0].style.opacity = String(1 - scene.mix);
    layers[1].style.opacity = String(scene.mix);

    if (firstRender) {
      // Commit the initial opacity without the 1.8-second fade-in.
      void layers[0].offsetWidth;
      document.documentElement.setAttribute('data-sky-ready', '');
    }

    setWeatherState(Boolean(weatherCondition), Boolean(weatherData) && !weatherPreview);
    document.documentElement.dataset.sky = weatherCondition
      ? `${weatherCondition}-${dominantLabel(scene)}`
      : dominantLabel(scene);
    document.documentElement.style.setProperty('--star-visibility', String(starVisibility(localScene).toFixed(3)));
    document.documentElement.style.setProperty('--back-cloud-visibility', String(backCloudVisibility(localScene).toFixed(3)));
    document.documentElement.style.setProperty('--front-cloud-visibility', String(frontCloudVisibility(localScene).toFixed(3)));
  }

  async function refreshWeather() {
    if (weatherPreview || document.hidden || !/^https?:$/.test(location.protocol)) return;
    lastWeatherCheck = Date.now();
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      let response;
      try {
        response = await fetch('/api/weather', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          credentials: 'omit',
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }

      const result = response.ok ? await response.json() : null;
      const latitude = Number(result?.location?.latitude);
      const longitude = Number(result?.location?.longitude);
      weatherData = result && parseWeather(result.condition) && typeof result.validAt === 'string' &&
        Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
        Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
        ? { condition: result.condition, validAt: result.validAt, location: { latitude, longitude } }
        : null;
    } catch (_) {
      weatherData = null;
    }
    render();
    if (!document.hidden) weatherTimer = window.setTimeout(refreshWeather, 30 * 60 * 1000);
  }

  function startLoop() {
    if (intervalId !== null || forcedTime !== null || forcedScene) return;
    intervalId = window.setInterval(render, 60_000);
  }

  function stopLoops() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (weatherTimer !== null) {
      window.clearTimeout(weatherTimer);
      weatherTimer = null;
    }
  }

  render();
  refreshWeather();
  startLoop();
  mobileQuery.addEventListener?.('change', render);

  // This is a brief-visit landing page, not something meant to keep running
  // in a background tab. Stop timers and requests while hidden, then catch up.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoops();
    } else {
      render();
      startLoop();
      if (Date.now() - lastWeatherCheck >= 30 * 60 * 1000) refreshWeather();
      else if (!weatherPreview && weatherTimer === null) weatherTimer = window.setTimeout(refreshWeather, 30 * 60 * 1000 - (Date.now() - lastWeatherCheck));
    }
  });
})();
