module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(503).json({ error: 'Login ainda não configurado' });
  }
  const origin = String(req.headers.origin || '');
  const allowed = ['https://mst-eletronicos.vercel.app', 'https://gamermigueltaikon.github.io'];
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    mpPublicKey: process.env.MP_PUBLIC_KEY || 'APP_USR-f781053f-5352-4e75-bf08-7ffbdfcee078'
  });
};
