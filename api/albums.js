// Função serverless (Vercel). A chave da API fica SÓ aqui, no servidor.
const PERIODS = ['7day', '1month', '3month', '6month', '12month', 'overall'];

module.exports = async (req, res) => {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return res.status(500).json({ error: 'LASTFM_API_KEY não configurada no servidor' });

  const { user = '', period = '7day' } = req.query;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);

  if (!/^[A-Za-z0-9_-]{2,15}$/.test(user)) return res.status(400).json({ error: 'usuário inválido' });
  if (!PERIODS.includes(period)) return res.status(400).json({ error: 'período inválido' });

  const url = new URL('https://ws.audioscrobbler.com/2.0/');
  url.search = new URLSearchParams({
    method: 'user.gettopalbums', user, period, limit, api_key: key, format: 'json',
  }).toString();

  try {
    const iu = new URL(url); iu.searchParams.set('method', 'user.getinfo'); iu.searchParams.delete('period'); iu.searchParams.delete('limit');
    const info = await fetch(iu).then((x) => x.json()).catch(() => ({}));
    const avatar = (info.user?.image || []).find((i) => i.size === 'large')?.['#text'] || '';
    const r = await fetch(url);
    const data = await r.json();
    if (data.error) {
      const notFound = data.error === 6;
      return res.status(notFound ? 404 : 502).json({ error: notFound ? 'usuário não encontrado' : data.message });
    }
    const albums = (data.topalbums?.album || []).map((a) => {
      const imgs = a.image || [];
      const cover = (imgs.find((i) => i.size === 'extralarge') || imgs[imgs.length - 1] || {})['#text'] || '';
      return { name: a.name, artist: a.artist?.name || '', plays: Number(a.playcount) || 0, cover };
    });
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ albums, avatar });
  } catch {
    res.status(502).json({ error: 'falha ao falar com o Last.fm' });
  }
};
