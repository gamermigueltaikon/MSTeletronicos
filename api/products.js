function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_ORIGIN || 'https://gamermigueltaikon.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return json(res, 503, { error: 'Catálogo público ainda não configurado' });
  }

  try {
    const endpoint = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products?select=*`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    const rows = await response.json();
    if (!response.ok) {
      console.error('Supabase products error', response.status, rows);
      return json(res, 502, { error: 'Não foi possível carregar os anúncios' });
    }
    return json(res, 200, Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('Public catalog error', error);
    return json(res, 500, { error: 'Não foi possível carregar os anúncios' });
  }
};
