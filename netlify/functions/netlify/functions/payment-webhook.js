const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    
    if (payload.type !== 'payment.succeeded') {
      return { statusCode: 200, body: 'Ignored' };
    }

    const { name, phone, address, pack_type, customer_type, notes } = payload.payload.metadata;

    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        pack_type,
        customer_type,
        notes: notes || null,
        status: 'paid'
      })
    });

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
