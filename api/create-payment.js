const crypto = require('node:crypto');
const { catalog, estimateFreight } = require('./catalog');

async function loadCatalog() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return catalog;
  const endpoint = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products?select=id,name,price,stock`;
  const response = await fetch(endpoint, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}` }
  });
  if (!response.ok) throw new Error(`Supabase catalog returned ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return catalog;
  return Object.fromEntries(rows.map(row => [
    String(row.id), { id: String(row.id), name: String(row.name), price: Number(row.price), stock: Number(row.stock) }
  ]));
}

function reply(res, status, body) {
  const origin = String(res.req?.headers?.origin || '');
  const allowed = ['https://mst-eletronicos.vercel.app', 'https://gamermigueltaikon.github.io'];
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return reply(res, 204, {});
  if (req.method !== 'POST') return reply(res, 405, { error: 'Método não permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 503, { error: 'Pagamento online não configurado' });
  try {
    const body = req.body || {};
    const name = String(body.customerName || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 120);
    const cep = String(body.cep || '').replace(/\D/g, '');
    const token = String(body.token || '');
    const paymentMethodId = String(body.payment_method_id || '');
    const installments = Math.min(Math.max(Number(body.installments || 1), 1), 12);
    if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !/^\d{8}$/.test(cep) || !Array.isArray(body.items) || !body.items.length) {
      return reply(res, 400, { error: 'Dados de pagamento inválidos' });
    }
    const onlineCatalog = await loadCatalog();
    const items = [];
    for (const requested of body.items) {
      const product = onlineCatalog[String(requested.id)];
      const quantity = Number(requested.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || quantity > product.stock) {
        return reply(res, 400, { error: 'Produto indisponível ou quantidade inválida' });
      }
      items.push({ title: product.name, quantity, unit_price: product.price, currency_id: 'BRL' });
    }
    const freight = estimateFreight(cep);
    const baseAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, freight.cost);
    const amount = baseAmount;
    const payment = {
      transaction_amount: Number(amount.toFixed(2)),
      description: `Pedido MST Eletrônicos ${crypto.randomUUID().slice(0, 8)}`,
      payer: { email, first_name: name.split(/\s+/)[0] },
      external_reference: `MST-${crypto.randomUUID()}`,
      notification_url: process.env.API_URL ? `${process.env.API_URL}/api/webhook` : undefined,
      installments,
      payment_method_id: paymentMethodId
    };
    if (token) payment.token = token;
    if (body.issuer_id) payment.issuer_id = String(body.issuer_id);
    if (body.payer?.identification?.type && body.payer?.identification?.number) {
      payment.payer.identification = {
        type: String(body.payer.identification.type),
        number: String(body.payer.identification.number)
      };
    }
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(payment)
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Mercado Pago payment error', response.status, result);
      return reply(res, 502, { error: result.message || 'Pagamento recusado pelo provedor' });
    }
    return reply(res, 200, { status: result.status, status_detail: result.status_detail, id: result.id, point_of_interaction: result.point_of_interaction });
  } catch (error) {
    console.error('Embedded payment error', error);
    return reply(res, 500, { error: 'Não foi possível processar o pagamento' });
  }
};
