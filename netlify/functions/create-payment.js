const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { amount, currency, name, phone, address, pack_type, customer_type, notes } = JSON.parse(event.body);

  const successUrl = `https://incandescent-muffin-88b96d.netlify.app/success.html?name=${encodeURIComponent(name)}&pack=${encodeURIComponent(pack_type)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&type=${encodeURIComponent(customer_type)}&notes=${encodeURIComponent(notes || '')}`;

  try {
    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency: 'ZAR',
        successUrl,
        cancelUrl: 'https://incandescent-muffin-88b96d.netlify.app',
        metadata: { name, phone, address, pack_type, customer_type, notes }
      })
    });

    const data = await response.json();
    
    if (!data.redirectUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No redirect URL from Yoco', detail: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ redirectUrl: data.redirectUrl })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
