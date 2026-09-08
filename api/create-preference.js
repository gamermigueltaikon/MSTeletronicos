const crypto = require('node:crypto');
const { catalog, estimateFreight } = require('./catalog');

const ALLOWED_METHODS = new Set(['pix', 'credit', 'debit']);
const SITE_URL = process.env.SITE_URL || 'https://gamermigueltaikon.github.io/MSTeletronicos';

function sendJson(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_ORIGIN || 'https://gamermigueltaikon.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método não permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return sendJson(res, 503, { error: 'Pagamento online não configurado' });

  try {
    const body = req.body || {};
    const customerName = String(body.customerName || '').trim().slice(0, 100);
    const cep = String(body.cep || '').replace(/\D/g, '');
    const paymentMethod = String(body.paymentMethod || '');
    const installments = Math.min(Math.max(Number(body.installments || 1), 1), 12);
    if (customerName.length < 2 || !/^\d{8}$/.test(cep) || !ALLOWED_METHODS.has(paymentMethod)) {
      return sendJson(res, 400, { error: 'Dados de checkout inválidos' });
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
      return sendJson(res, 400, { error: 'Carrinho inválido' });
    }

    const items = [];
    for (const requested of body.items) {
      const product = catalog[String(requested.id)];
      const quantity = Number(requested.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || quantity > product.stock) {
        return sendJson(res, 400, { error: 'Produto indisponível ou quantidade inválida' });
      }
      items.push({ title: product.name, quantity, unit_price: product.price, currency_id: 'BRL' });
    }

    const freight = estimateFreight(cep);
    const orderId = `MST-${crypto.randomUUID()}`;
    const preference = {
      items,
      payer: { name: customerName },
      shipments: { cost: freight.cost, mode: 'not_specified' },
      external_reference: orderId,
      back_urls: {
        success: `${SITE_URL}/?payment=success`,
        failure: `${SITE_URL}/?payment=failure`,
        pending: `${SITE_URL}/?payment=pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'MST ELETRONICOS',
      metadata: { cep, payment_method: paymentMethod, installments }
    };
    if (process.env.API_URL) preference.notification_url = `${process.env.API_URL}/api/webhook`;
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preference)
    });
    const result = await response.json();
    if (!response.ok || !result.init_point) {
      console.error('Mercado Pago preference error', response.status, result);
      return sendJson(res, 502, { error: 'Mercado Pago não aceitou o pedido' });
    }
    return sendJson(res, 200, { init_point: result.init_point, order_id: orderId });
  } catch (error) {
    console.error('Checkout error', error);
    return sendJson(res, 500, { error: 'Não foi possível iniciar o pagamento' });
  }
};
