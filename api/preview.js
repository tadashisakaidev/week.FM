// Acha uma prévia de 30s (iTunes) pra um álbum clicado na colagem.
const norm = (s) => (s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

module.exports = async (req, res) => {
  const { artist = '', album = '' } = req.query;
  if (!artist || !album || artist.length > 100 || album.length > 150) return res.status(400).json({ error: 'parâmetros inválidos' });
  try {
    const q = new URLSearchParams({ term: `${artist} ${album}`, media: 'music', entity: 'song', limit: '25' });
    const j = await (await fetch('https://itunes.apple.com/search?' + q)).json();
    const a = norm(artist), al = norm(album).slice(0, 12);
    const hits = (j.results || []).filter((x) => { const b = norm(x.artistName); return x.previewUrl && (a.includes(b) || b.includes(a)); });
    const hit = hits.find((x) => norm(x.collectionName).includes(al)) || hits[0];
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json(hit ? { preview: hit.previewUrl, name: hit.trackName } : { preview: null });
  } catch { res.status(502).json({ error: 'falha ao buscar prévia' }); }
};
