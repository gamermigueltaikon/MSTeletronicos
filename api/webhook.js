module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_ORIGIN || 'https://gamermigueltaikon.github.io');
  res.setHeader('Cache-Control', 'no-store');
  const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id;
  if (paymentId && process.env.MP_ACCESS_TOKEN) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      if (response.ok) {
        const payment = await response.json();
        console.log(JSON.stringify({ event: 'payment_update', id: payment.id, status: payment.status, reference: payment.external_reference }));
      }
    } catch (error) {
      console.error('Webhook verification error', error);
    }
  }
  return res.status(200).json({ received: true });
};
