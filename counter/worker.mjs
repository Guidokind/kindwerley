const allowedOrigins = new Set(['https://kindwerley.com', 'https://www.kindwerley.com']);
export default {
  async fetch(request, env) {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (new URL(request.url).pathname !== '/api/visits') return reply({ error: 'Not found' }, 404);
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (!allowedOrigins.has(request.headers.get('Origin'))) return reply({ error: 'Forbidden' }, 403);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'Invalid type' }, 415);
    try {
      const body = await request.text();
      if (body.length > 100) return reply({ error: 'Too large' }, 413);
      const { id } = JSON.parse(body);
      if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return reply({ error: 'Invalid ID' }, 400);
      const result = await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO visits (id) VALUES (?)').bind(id),
        env.DB.prepare('SELECT total FROM counter WHERE id = 1')
      ]);
      return reply({ total: result[1].results[0].total });
    } catch (_) { return reply({ error: 'Unavailable' }, 503); }
  }
};
