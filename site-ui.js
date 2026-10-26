(() => {
  'use strict';
  const picker = document.querySelector('.languages');
  document.addEventListener('click', event => {
    if (picker && !picker.contains(event.target)) picker.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker?.open) {
      picker.open = false;
      picker.querySelector('summary').focus();
    }
  });

  // Activate the included Cloudflare Worker on this same-origin route.
  // Empty means disabled: no request and no placeholder number.
  const COUNTER_ENDPOINT = '/api/visits';
  if (!COUNTER_ENDPOINT || !/^https?:$/.test(location.protocol)) return;
  async function loadCounter() {
    try {
      const key = 'kindwerley-visit';
      const now = Date.now();
      let visit;
      try { visit = JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
      if (!visit || typeof visit.id !== 'string' || !Number.isFinite(visit.time) || now - visit.time > 30 * 60 * 1000) {
        visit = { id: crypto.randomUUID(), time: now };
      }
      visit.time = now;
      try { sessionStorage.setItem(key, JSON.stringify(visit)); } catch (_) {}
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      let response;
      try {
        response = await fetch(COUNTER_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: visit.id }), signal: controller.signal,
          cache: 'no-store', credentials: 'omit'
        });
      } finally { clearTimeout(timer); }
      if (!response.ok) return;
      const { total } = await response.json();
      if (!Number.isSafeInteger(total) || total < 1) return;
      document.getElementById('visit-total').textContent = new Intl.NumberFormat(document.documentElement.lang).format(total);
      document.querySelector('.visit-counter').hidden = false;
    } catch (_) { /* Leave the counter hidden if storage or the service is unavailable. */ }
  }
  loadCounter();
})();
