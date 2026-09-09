module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(503).json({ error: 'Login ainda não configurado' });
  }
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_ORIGIN || 'https://gamermigueltaikon.github.io');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  });
};
