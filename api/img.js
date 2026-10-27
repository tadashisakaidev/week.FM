// Proxy de capas. Necessário para o canvas poder exportar PNG (evita erro de CORS).
const ALLOWED = (h) => /^lastfm[a-z0-9-]*\.freetls\.fastly\.net$/.test(h) || h.endsWith('.last.fm');
module.exports = async (req, res) => {
  let target;
  try { target = new URL(req.query.url); } catch { return res.status(400).end(); }
  if (target.protocol !== 'https:' || !ALLOWED(target.hostname)) return res.status(400).end();

  try {
    const r = await fetch(target);
    if (!r.ok) return res.status(404).end();
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400');
    res.status(200).send(buf);
  } catch {
    res.status(502).end();
  }
};
