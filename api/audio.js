// Repassa a prévia do iTunes pro navegador (necessário pra gravar o áudio no vídeo).
const ALLOWED = (h) => h.endsWith('.mzstatic.com') || h.endsWith('.itunes.apple.com');

module.exports = async (req, res) => {
  let target;
  try { target = new URL(req.query.url); } catch { return res.status(400).end(); }
  if (target.protocol !== 'https:' || !ALLOWED(target.hostname)) return res.status(400).end();
  try {
    const r = await fetch(target);
    if (!r.ok) return res.status(404).end();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'audio/mp4');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=86400');
    res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch { res.status(502).end(); }
};
