function json(res, status, body) {
  const origin = String(res.req?.headers?.origin || '');
  const allowed = ['https://mst-eletronicos.vercel.app', 'https://gamermigueltaikon.github.io'];
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

function productPayload(value) {
  const source = value && typeof value === 'object' ? value : {};
  const price = Number(source.price);
  const stock = source.stock === 'out' ? 0 : Number(source.stock);
  if (!/^[\w-]{1,80}$/.test(String(source.id || '')) ||
      !String(source.name || '').trim() ||
      !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0) return null;
  return {
    id: String(source.id),
    name: String(source.name).trim().slice(0, 120),
    description: String(source.description || '').trim().slice(0, 1000),
    price: Number(price.toFixed(2)),
    stock,
    image_url: String(source.image_url || '').slice(0, 200000),
    category: String(source.category || 'Outros aparelhos').slice(0, 40),
    platform: String(source.platform || 'Outros').slice(0, 40),
    condition: String(source.condition || 'Novo').slice(0, 20),
    featured: Boolean(source.featured),
    media: source.media && typeof source.media === 'object' ? source.media : {}
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'POST' && req.method !== 'DELETE') return json(res, 405, { error: 'Método não permitido' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.ADMIN_API_KEY) {
    return json(res, 503, { error: 'Persistência administrativa ainda não configurada' });
  }
  if (req.headers['x-admin-key'] !== process.env.ADMIN_API_KEY) {
    return json(res, 401, { error: 'Chave administrativa inválida' });
  }

  const base = process.env.SUPABASE_URL.replace(/\/$/, '');
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal'
  };
  try {
    if (req.method === 'DELETE') {
      const id = String(req.body?.id || req.query?.id || '');
      if (!/^[\w-]{1,80}$/.test(id)) return json(res, 400, { error: 'ID inválido' });
      const response = await fetch(`${base}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers });
      if (!response.ok) return json(res, 502, { error: 'Não foi possível excluir o anúncio' });
      return json(res, 200, { ok: true });
    }
    const product = productPayload(req.body);
    if (!product) return json(res, 400, { error: 'Dados do anúncio inválidos' });
    let response = await fetch(`${base}/rest/v1/products`, { method: 'POST', headers, body: JSON.stringify(product) });
    if (!response.ok) {
      const details = await response.text();
      console.error('Supabase admin products error', response.status, details);
      // Keep saving working when the base table exists but optional marketplace
      // columns have not been added yet.
      const baseProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url
      };
      response = await fetch(`${base}/rest/v1/products`, { method: 'POST', headers, body: JSON.stringify(baseProduct) });
      if (!response.ok) {
        const fallbackDetails = await response.text();
        console.error('Supabase base product error', response.status, fallbackDetails);
        return json(res, 502, { error: 'Não foi possível salvar o anúncio. Verifique a tabela products no Supabase.' });
      }
    }
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Admin products error', error);
    return json(res, 500, { error: 'Não foi possível atualizar o anúncio' });
  }
};
