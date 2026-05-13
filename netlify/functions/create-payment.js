const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { amount, name, phone, address, pack_type, customer_type, notes } = JSON.parse(event.body);

  const successUrl = `https://incandescent-muffin-88b96d.netlify.app/success.html?name=${encodeURIComponent(name)}&pack=${encodeURIComponent(pack_type)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&type=${encodeURIComponent(customer_type)}&notes=${encodeURIComponent(notes || '')}`;

  const postData = JSON.stringify({
    amount,
    currency: 'ZAR',
    successUrl,
    cancelUrl: 'https://incandescent-muffin-88b96d.netlify.app',
    metadata: { name, phone, address, pack_type, customer_type, notes }
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'payments.yoco.com',
      path: '/api/checkouts',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.redirectUrl) {
            resolve({ statusCode: 200, body: JSON.stringify({ redirectUrl: parsed.redirectUrl }) });
          } else {
            resolve({ statusCode: 500, body: JSON.stringify({ error: 'No redirect URL', detail: parsed }) });
          }
        } catch (e) {
          resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });

    req.write(postData);
    req.end();
  });
};
