// Pega a faixa mais ouvida no Last.fm e procura a prévia de 30s no iTunes (grátis, sem chave).
const PERIODS = ['7day', '1month', '3month', '6month', '12month', 'overall'];
const norm = (s = '') => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

async function findPreview(artist, name) {
  const q = new URLSearchParams({ term: `${artist} ${name}`, media: 'music', entity: 'song', limit: '5' });
  const r = await fetch('https://itunes.apple.com/search?' + q);
  const j = await r.json();
  const a = norm(artist);
  const hit = (j.results || []).find((x) => {
    const b = norm(x.artistName);
    return x.previewUrl && (a.includes(b) || b.includes(a));
  });
  return hit ? hit.previewUrl : null;
}

module.exports = async (req, res) => {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return res.status(500).json({ error: 'LASTFM_API_KEY não configurada' });
  const { user = '', period = '7day' } = req.query;
  if (!/^[A-Za-z0-9_-]{2,15}$/.test(user) || !PERIODS.includes(period)) return res.status(400).json({ error: 'parâmetros inválidos' });

  const url = new URL('https://ws.audioscrobbler.com/2.0/');
  url.search = new URLSearchParams({ method: 'user.gettoptracks', user, period, limit: '5', api_key: key, format: 'json' }).toString();

  try {
    const data = await (await fetch(url)).json();
    const tracks = (data.toptracks?.track || []).map((t) => ({ name: t.name, artist: t.artist?.name || '', plays: Number(t.playcount) || 0 }));
    if (!tracks.length) return res.status(200).json({ track: null });

    let found = { ...tracks[0], preview: null };
    for (const t of tracks) {            // tenta as 5 mais ouvidas até achar uma com prévia
      const preview = await findPreview(t.artist, t.name).catch(() => null);
      if (preview) { found = { ...t, preview }; break; }
    }
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ track: found });
  } catch {
    res.status(502).json({ error: 'falha ao buscar a faixa' });
  }
};
